// src/app/api/orders/shipments/bulk-print/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/lib/payloadAuth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { PDFDocument } from "pdf-lib";

// ================================================================
// 🛡️ 1. SSRF PROTECTION: Allowed Domains for Labels
// ================================================================

// AFTER (Cloudinary removed)
const ALLOWED_LABEL_DOMAINS = (process.env.ALLOWED_LABEL_DOMAINS || 
  "s3.amazonaws.com,tcs.com.pk,leopards.com.pk,postex.pk,trax.com.pk"
).split(',').map(d => d.trim());

function isValidLabelUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '0.0.0.0') {
      return false;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const isAllowed = ALLOWED_LABEL_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    return isAllowed;
  } catch {
    return false;
  }
}

// ================================================================
// 📦 2. CONSTANTS
// ================================================================

const CONCURRENCY_LIMIT = 3;
const MAX_LABELS = 100;
const DOWNLOAD_TIMEOUT_MS = 15000;

// ================================================================
// 🚀 MAIN HANDLER
// ================================================================

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics"]);

    // 2. Parse Request
    const body = await req.json();
    let { orderIds, shipmentIds } = body;

    // If orderIds are provided, fetch shipment IDs from DB
    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      if (orderIds.length > MAX_LABELS) {
        return NextResponse.json(
          { error: `Cannot process more than ${MAX_LABELS} orders at once.` },
          { status: 400 }
        );
      }

      await connectMongoose();
      
      const orders = await Order.aggregate([
        { $match: { _id: { $in: orderIds } } },
        { $project: { 
          shipments: { 
            $slice: ["$shipments", -1]
          } 
        } }
      ]);

      const foundShipmentIds = orders
        .flatMap(o => o.shipments || [])
        .map(s => s.id)
        .filter(Boolean);

      if (foundShipmentIds.length === 0) {
        return NextResponse.json(
          { error: "No shipments found for the given orders." },
          { status: 404 }
        );
      }
      shipmentIds = foundShipmentIds;
    }

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return NextResponse.json(
        { error: "No shipment IDs provided." },
        { status: 400 }
      );
    }

    if (shipmentIds.length > MAX_LABELS) {
      return NextResponse.json(
        { error: `Cannot print more than ${MAX_LABELS} labels at once.` },
        { status: 400 }
      );
    }

    // 3. Fetch Shipment Data
    await connectMongoose();
    const ordersWithShipments = await Order.find(
      { "shipments.id": { $in: shipmentIds } },
      { shipments: 1, orderId: 1 }
    ).lean();

    const targetShipments: Array<{
      id: string;
      trackingId: string;
      labelUrl: string;
      courierName: string;
    }> = [];

    const validIds = new Set(shipmentIds);
    for (const order of ordersWithShipments) {
      for (const shipment of order.shipments || []) {
        if (validIds.has(shipment.id) && shipment.labelUrl) {
          targetShipments.push({
            id: shipment.id,
            trackingId: shipment.trackingId,
            labelUrl: shipment.labelUrl,
            courierName: shipment.courierName || shipment.courier || 'Unknown',
          });
        }
      }
    }

    if (targetShipments.length === 0) {
      return NextResponse.json(
        { error: "No valid labels found." },
        { status: 404 }
      );
    }

    // 4. 🛡️ SSRF Check
    const safeShipments = targetShipments.filter(s => {
      if (!isValidLabelUrl(s.labelUrl)) {
        console.warn(`🚨 [Security] Blocked invalid label URL: ${s.labelUrl}`);
        return false;
      }
      return true;
    });

    if (safeShipments.length === 0) {
      return NextResponse.json(
        { error: "All label URLs are blocked due to security policy." },
        { status: 403 }
      );
    }

    // 5. 🔽 Download PDFs Concurrently
    const pdfBuffers: Buffer[] = [];
    const failedDownloads: string[] = [];

    for (let i = 0; i < safeShipments.length; i += CONCURRENCY_LIMIT) {
      const chunk = safeShipments.slice(i, i + CONCURRENCY_LIMIT);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(async (shipment) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

            const response = await fetch(shipment.labelUrl, {
              headers: { 
                "User-Agent": "PocketValue-OMS/1.0",
                "Accept": "application/pdf",
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && !contentType.includes("pdf")) {
              throw new Error(`Invalid content-type: ${contentType}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            if (buffer.length < 100) {
              throw new Error("PDF file too small (corrupted)");
            }

            const isValidPdf = buffer.toString('ascii', 0, 5) === '%PDF-';
            if (!isValidPdf) {
              throw new Error("Invalid PDF format");
            }

            return { 
              success: true as const, 
              buffer, 
              trackingId: shipment.trackingId 
            };
          } catch (error: any) {
            console.error(`Failed to download label for ${shipment.trackingId}: ${error.message}`);
            return { 
              success: false as const, 
              trackingId: shipment.trackingId, 
              error: error.message 
            };
          }
        })
      );

      for (const result of chunkResults) {
        if (result.status === 'fulfilled' && result.value.success) {
          pdfBuffers.push(result.value.buffer);
        } else if (result.status === 'fulfilled') {
          failedDownloads.push(result.value.trackingId);
        } else {
          failedDownloads.push('unknown');
        }
      }
    }

    if (pdfBuffers.length === 0) {
      return NextResponse.json(
        { 
          error: `Failed to fetch any label PDFs. Failed: ${failedDownloads.join(", ")}` 
        },
        { status: 500 }
      );
    }

    // 6. 🧠 MERGE PDFs (Chunked to prevent memory spikes)
    const mergedPdf = await PDFDocument.create();
    let pagesAdded = 0;

    for (let i = 0; i < pdfBuffers.length; i += CONCURRENCY_LIMIT) {
      const chunk = pdfBuffers.slice(i, i + CONCURRENCY_LIMIT);
      
      const docs = await Promise.all(
        chunk.map(async (buffer) => {
          try {
            return await PDFDocument.load(buffer, { ignoreEncryption: true });
          } catch (error) {
            console.error("Failed to parse PDF, skipping:", error);
            return null;
          }
        })
      );

      for (const doc of docs) {
        if (doc) {
          try {
            const pageIndices = doc.getPageIndices();
            if (pageIndices.length === 0) continue;
            
            const pages = await mergedPdf.copyPages(doc, pageIndices);
            pages.forEach((page) => mergedPdf.addPage(page));
            pagesAdded += pages.length;
          } catch (copyError) {
            console.error("Failed to copy pages from a PDF, skipping:", copyError);
          }
        }
      }
    }

    if (pagesAdded === 0) {
      return NextResponse.json(
        { error: "Merged PDF is empty. Labels may be corrupted." },
        { status: 500 }
      );
    }

    // ✅ FIX 1: Save merged PDF to Uint8Array
    const mergedBytes = await mergedPdf.save();

    // ✅ FIX 2: Convert to Buffer for NextResponse (fixes BodyInit type error)
    const pdfBuffer = Buffer.from(mergedBytes);

    // 7. 📊 Audit Log
    await logUserEvent("crm_sync", "/api/orders/shipments/bulk-print", {
      action: "bulk_labels_printed",
      requested: targetShipments.length,
      printed: safeShipments.length - failedDownloads.length,
      failed: failedDownloads.length,
      shipments: safeShipments.map(s => s.id),
      timestamp: new Date().toISOString(),
    });

    // 8. 📥 Return PDF
    const filename = `bulk-labels-${Date.now()}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  } catch (error: any) {
    console.error("Bulk Label Print Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bulk labels." },
      { status: 500 }
    );
  }
}
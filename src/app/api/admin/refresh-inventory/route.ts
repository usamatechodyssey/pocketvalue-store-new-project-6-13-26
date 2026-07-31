// src/app/api/admin/refresh-inventory/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/lib/payloadAuth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { SystemStats } from "@/models/SystemStats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. RBAC Check (Sirf Admin/Manager)
    await verifyStaff(["admin", "manager"]);

    // 🔌 2. Database Connections
    await connectMongoose();
    const payload = await getSafePayload();

    const mongooseConnection = payload.db.connection;
    if (!mongooseConnection) {
      throw new Error("Mongoose connection not available");
    }

    const ProductModel = mongooseConnection.model("products");

    // 📦 3. Fetch Low Stock Threshold from Settings
    const settings = await payload.findGlobal({ slug: "settings" });
    const lowStockThreshold = settings.inventorySettings?.lowStockThreshold ?? 5;

    console.log(`🔄 Refreshing Inventory Stats (Threshold: ${lowStockThreshold})...`);

    // ⚡ 4. Heavy Aggregation (Yahan par DB load aayega, lekin background mein)
    const stats = await ProductModel.aggregate([
      { $unwind: "$variants" },
      {
        $group: {
          _id: null,
          totalVariants: { $sum: 1 },
          criticalStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $ifNull: ["$variants.stock", 0] }, 0] },
                    { $lte: [{ $ifNull: ["$variants.stock", 0] }, lowStockThreshold] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStock: {
            $sum: {
              $cond: [
                { $lte: [{ $ifNull: ["$variants.stock", 0] }, 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const data = stats[0] || { totalVariants: 0, criticalStock: 0, outOfStock: 0 };

    // 💾 5. Save to SystemStats (Singleton Upsert)
    const updatedDoc = await SystemStats.findOneAndUpdate(
      { _id: "inventory" },
      {
        $set: {
          totalVariants: data.totalVariants,
          criticalStockCount: data.criticalStock,
          outOfStockCount: data.outOfStock,
          lastUpdated: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(
      `✅ Inventory Stats Updated: Total: ${data.totalVariants}, Critical: ${data.criticalStock}, OutOfStock: ${data.outOfStock}`
    );

    // ✅ 6. Success Response
    return NextResponse.json({
      success: true,
      message: "Inventory stats refreshed successfully!",
      data: {
        totalVariants: updatedDoc.totalVariants,
        criticalStockCount: updatedDoc.criticalStockCount,
        outOfStockCount: updatedDoc.outOfStockCount,
        lastUpdated: updatedDoc.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error("❌ Failed to refresh inventory:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
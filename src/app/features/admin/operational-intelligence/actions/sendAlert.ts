// 📂 src/app/features/admin/operational-intelligence/actions/sendAlert.ts

"use server";

import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { sendAlert, AlertSeverity } from "@/lib/alerting/alert-engine";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";

// ================================================================
// ✅ TYPES
// ================================================================
export interface OperationalAlertData {
  limboRevenue: number;
  pendingCount: number;
  totalOrders: number;
  fulfillmentRate: number;
  range: { from: Date | string; to: Date | string };
}

// ================================================================
// 🚀 MAIN FUNCTION (Protected with verifyAdminAccess + 15-min Anti-Spam)
// ================================================================
export async function sendOperationalAlert(data: OperationalAlertData) {
  try {
    // ✅ 1. Security Check
    await verifyAdminAccess();

    // ✅ 2. Fetch Settings
    const settings = await getCachedSettings();
    const threshold = settings?.operational?.limboRevenueThreshold ?? 1000000;

    // ✅ 3. Check if threshold is exceeded
    if (data.limboRevenue <= threshold) {
      console.log(`ℹ️ Limbo Revenue (Rs. ${data.limboRevenue.toLocaleString('en-PK')}) is within threshold (Rs. ${threshold.toLocaleString('en-PK')}). No alert sent.`);
      return { sent: false, reason: "Threshold not exceeded" };
    }

    // ✅ 4. Determine Severity
    let severity = AlertSeverity.MEDIUM;
    if (data.limboRevenue > threshold * 5) {
      severity = AlertSeverity.CRITICAL;
    } else if (data.limboRevenue > threshold * 2) {
      severity = AlertSeverity.HIGH;
    }

    // ✅ 5. Anti-Spam Redis Lock (15 Minutes Debounce per severity)
    const lockKey = `lock:alert_operational_limbo:${severity}`;
    const lockAcquired = await redis.set(lockKey, "sent", { nx: true, ex: 900 }); // 15 min TTL

    if (!lockAcquired) {
      console.log(`⏳ Operational alert recently sent. Rate limit active (15-min lock).`);
      return { sent: false, reason: "Alert rate-limited (15-min lock active)" };
    }

    // ✅ 6. Safe Date Coercion (Prevents string toDateString crash)
    const fromDate = data.range?.from ? new Date(data.range.from) : new Date();
    const toDate = data.range?.to ? new Date(data.range.to) : new Date();

    // ✅ 7. Get Recipient and Slack Webhook
    const recipient = settings?.storeContactEmail || process.env.EMAIL_FROM_ADDRESS || "admin@localhost";
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;

    if (!recipient) {
      console.warn("⚠️ No email recipient found. Alert not sent.");
      return { sent: false, reason: "No recipient email configured" };
    }

    // ✅ 8. Send Alert (PKR Localized)
    await sendAlert(
      {
        subject: `🚨 Limbo Revenue Alert: Rs. ${data.limboRevenue.toLocaleString('en-PK')}`,
        message: `Operational Intelligence has detected that Limbo Revenue has crossed the configured threshold of Rs. ${threshold.toLocaleString('en-PK')}. Current: Rs. ${data.limboRevenue.toLocaleString('en-PK')}. Immediate action is recommended to review stuck orders.`,
        severity,
        metadata: {
          "Current Limbo Revenue": `Rs. ${data.limboRevenue.toLocaleString('en-PK')}`,
          "Configured Threshold": `Rs. ${threshold.toLocaleString('en-PK')}`,
          "Pending Stuck Orders": data.pendingCount.toLocaleString('en-PK'),
          "Total Scope Orders": data.totalOrders.toLocaleString('en-PK'),
          "Fulfillment Rate": `${data.fulfillmentRate}%`,
          "Audit Period": `${format(fromDate, "MMM dd, yyyy")} - ${format(toDate, "MMM dd, yyyy")}`,
          "Timestamp": new Date().toISOString(),
        },
      },
      {
        emailRecipient: recipient,
        slackWebhookUrl: slackWebhook,
      }
    );

    console.log(`✅ Operational Alert sent to ${recipient} (Severity: ${severity})`);
    return { sent: true, severity, recipient };
  } catch (error: any) {
    console.error("❌ Failed to send operational alert:", error.message);
    return { sent: false, error: error.message };
  }
}
// src/lib/alerting/alert-engine.ts

import { sendEmail } from "@/lib/email";

// ================================================================
// ✅ TYPES
// ================================================================
export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AlertPayload {
  subject: string;
  message: string;
  severity: AlertSeverity;
  metadata?: Record<string, any>;
}

// ================================================================
// 📧 EMAIL ALERT (Using your existing sendEmail)
// ================================================================
async function sendEmailAlert(payload: AlertPayload, recipient: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin: 0;">🚨 Operational Alert</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Severity: <strong style="color: ${payload.severity === 'CRITICAL' ? '#b91c1c' : payload.severity === 'HIGH' ? '#ef4444' : payload.severity === 'MEDIUM' ? '#f59e0b' : '#6b7280'};">${payload.severity}</strong></p>
      </div>
      
      <div style="margin: 20px 0;">
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">${payload.message}</p>
      </div>
      
      ${payload.metadata ? `
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="font-size: 14px; font-weight: bold; color: #475569; margin: 0 0 8px;">📊 Details</p>
        <pre style="margin: 0; font-size: 12px; color: #1e293b; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(payload.metadata, null, 2)}</pre>
      </div>
      ` : ""}
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
        Sent from PocketValue Operations Engine • ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  await sendEmail({
    to: recipient,
    subject: `[${payload.severity}] ${payload.subject}`,
    html,
  });
}

// ================================================================
// 💬 SLACK ALERT (Optional)
// ================================================================
async function sendSlackAlert(payload: AlertPayload, webhookUrl: string) {
  const colorMap = {
    LOW: "#6b7280",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
    CRITICAL: "#b91c1c",
  };

  const fields = Object.entries(payload.metadata || {}).map(([key, value]) => ({
    title: key,
    value: String(value),
    short: true,
  }));

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [
        {
          color: colorMap[payload.severity] || "#6b7280",
          title: `🚨 ${payload.subject}`,
          text: payload.message,
          fields: fields.length > 0 ? fields : undefined,
          footer: "PocketValue Operations Engine",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error(`Slack Alert Failed: ${response.statusText}`);
  }
}

// ================================================================
// 🚀 MAIN EXPORT
// ================================================================
export async function sendAlert(
  payload: AlertPayload,
  config: {
    emailRecipient?: string;
    slackWebhookUrl?: string;
  }
) {
  const tasks: Promise<any>[] = [];

  // 1. Send Email
  if (config.emailRecipient) {
    tasks.push(
      sendEmailAlert(payload, config.emailRecipient).catch((err) =>
        console.error("❌ Email alert failed:", err.message)
      )
    );
  } else {
    console.warn("⚠️ No email recipient configured. Skipping email alert.");
  }

  // 2. Send Slack (Optional)
  if (config.slackWebhookUrl) {
    tasks.push(
      sendSlackAlert(payload, config.slackWebhookUrl).catch((err) =>
        console.error("❌ Slack alert failed:", err.message)
      )
    );
  }

  await Promise.allSettled(tasks);
}
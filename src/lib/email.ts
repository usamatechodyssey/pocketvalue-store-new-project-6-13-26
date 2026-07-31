// src/lib/email.ts
import nodemailer from 'nodemailer';

let transporterInstance: nodemailer.Transporter | null = null;

/**
 * Singleton Email Transporter with connection pooling.
 * Optimized for serverless environments (Vercel).
 */
export const getEmailTransporter = (): nodemailer.Transporter => {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return transporterInstance;
};

/**
 * Unified email send function.
 * Can be extended to support Mailjet/Resend adapters later.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM_ADDRESS,
  replyTo = process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM_ADDRESS,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<void> {
  const transporter = getEmailTransporter();
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${from}>`,
    to,
    subject,
    html,
    replyTo,
  });
}

/**
 * Alias for backward compatibility with existing code.
 */
export const sendEmailViaSMTP = sendEmail;
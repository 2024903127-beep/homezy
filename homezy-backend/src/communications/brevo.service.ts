import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// ─── Shared HTML wrapper ───────────────────────────────────────────────────
function emailWrapper(bodyHtml: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Homezy</title>
  </head>
  <body style="margin:0;padding:0;background:#F0FDF4;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#10B981);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">🏠 Homezy</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">Expert Home Services</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#94A3B8;font-size:11px;line-height:1.8;">
                This email was sent by <strong>Homezy Expert Services</strong>.<br/>
                If you didn't request this, you can safely ignore it.<br/>
                <span style="color:#CBD5E1;">© 2026 Homezy. All rights reserved.</span>
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
}

function infoBox(rows: { label: string; value: string }[]): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;margin:16px 0;overflow:hidden;">
    ${rows
      .map(
        (r, i) => `
      <tr style="border-top:${i > 0 ? '1px solid #E2E8F0' : 'none'};">
        <td style="padding:10px 16px;font-size:12px;color:#64748B;font-weight:600;width:40%;">${r.label}</td>
        <td style="padding:10px 16px;font-size:13px;color:#0F172A;font-weight:700;">${r.value}</td>
      </tr>`,
      )
      .join('')}
  </table>
  `;
}

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private apiKey: string | undefined;
  private senderEmail: string;
  private senderName: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('BREVO_API_KEY');
    this.senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL', 'support@homezy.in');
    this.senderName = this.config.get<string>('BREVO_SENDER_NAME', 'Homezy');

    if (this.apiKey) {
      this.logger.log(`✅ Brevo Email initialized — sender: ${this.senderName} <${this.senderEmail}>`);
    } else {
      this.logger.warn('⚠️  BREVO_API_KEY not configured — emails will be logged to console only');
    }
  }

  // ─── Core sender ────────────────────────────────────────────────────────────
  async sendEmail(options: {
    to: string;
    subject: string;
    htmlContent: string;
    attachment?: { name: string; content: string }[];
  }): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.log(`[DEV EMAIL] To: ${options.to} | Subject: ${options.subject}`);
      return true;
    }

    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.htmlContent,
          ...(options.attachment ? { attachment: options.attachment } : {}),
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`📧 Email sent → ${options.to} | "${options.subject}"`);
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      this.logger.error(`❌ Brevo send failed to ${options.to}: ${msg}`);
      return false;
    }
  }

  // ─── 1. OTP / Verification ──────────────────────────────────────────────────
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const body = `
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">Your Verification Code</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Use the code below to securely sign in to your <strong>Homezy</strong> account. This code expires in <strong>5 minutes</strong>.
      </p>
      <div style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border:2px dashed #10B981;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:11px;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:2px;">One-Time Password</p>
        <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#0F172A;font-family:monospace;">${otp}</span>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin:0;line-height:1.6;">
        🔒 Never share this code with anyone. Homezy will never ask for your OTP via phone or chat.
      </p>
    `;
    return this.sendEmail({
      to: email,
      subject: `${otp} is your Homezy verification code`,
      htmlContent: emailWrapper(body),
    });
  }

  // ─── 2. Booking Confirmed ───────────────────────────────────────────────────
  async sendBookingConfirmation(
    email: string,
    bookingId: string,
    serviceName: string,
    scheduledAt: string,
    price: number,
    customerName?: string,
  ): Promise<boolean> {
    const body = `
      <div style="margin:0 0 20px;">
        <span style="background:#DCFCE7;color:#15803D;font-size:11px;font-weight:800;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Booking Confirmed ✅</span>
      </div>
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">
        Hi ${customerName || 'there'}! Your booking is confirmed.
      </h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        A verified Homezy professional will arrive at your scheduled time. You'll receive an update when they're on their way.
      </p>
      ${infoBox([
        { label: '📋 Booking ID', value: `#${bookingId.slice(-8).toUpperCase()}` },
        { label: '🔧 Service', value: serviceName },
        { label: '📅 Scheduled At', value: scheduledAt },
        { label: '💰 Amount', value: `₹${price}` },
        { label: '🛡️ Warranty', value: '30-day service guarantee' },
      ])}
      <div style="background:#F0FDF4;border-left:4px solid #10B981;border-radius:0 8px 8px 0;padding:14px 16px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">
          💡 Pro Tip: Keep your door accessible and ensure a power socket is nearby for any equipment.
        </p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `✅ Booking Confirmed — ${serviceName} (ID: #${bookingId.slice(-8).toUpperCase()})`,
      htmlContent: emailWrapper(body),
    });
  }

  // ─── 3. Provider Assigned ───────────────────────────────────────────────────
  async sendProviderAssigned(
    email: string,
    providerName: string,
    providerPhone: string,
    serviceName: string,
    scheduledAt: string,
    customerName?: string,
  ): Promise<boolean> {
    const body = `
      <div style="margin:0 0 20px;">
        <span style="background:#DBEAFE;color:#1D4ED8;font-size:11px;font-weight:800;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Professional Assigned 👷</span>
      </div>
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">
        ${customerName || 'Hi'}, your expert is confirmed!
      </h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        A background-verified Homezy professional has been assigned to your booking and will arrive at the scheduled time.
      </p>
      ${infoBox([
        { label: '👷 Professional', value: providerName },
        { label: '📞 Contact', value: providerPhone },
        { label: '🔧 Service', value: serviceName },
        { label: '📅 Arriving At', value: scheduledAt },
      ])}
      <p style="color:#64748B;font-size:13px;margin:20px 0 0;line-height:1.6;">
        Your professional carries a Homezy ID badge. If you have any concerns, contact us immediately.
      </p>
    `;
    return this.sendEmail({
      to: email,
      subject: `👷 Professional Assigned — ${providerName} will arrive for ${serviceName}`,
      htmlContent: emailWrapper(body),
    });
  }

  // ─── 4. Provider Arrived / In Progress ─────────────────────────────────────
  async sendProviderArrived(
    email: string,
    serviceName: string,
    providerName: string,
    customerName?: string,
  ): Promise<boolean> {
    const body = `
      <div style="margin:0 0 20px;">
        <span style="background:#FEF9C3;color:#A16207;font-size:11px;font-weight:800;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Professional Arrived 🚪</span>
      </div>
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">
        ${customerName ? `Hi ${customerName}!` : ''} Your professional has arrived.
      </h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        <strong>${providerName}</strong> has arrived at your location and will begin the <strong>${serviceName}</strong> shortly.
      </p>
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin:0 0 20px;text-align:center;">
        <p style="margin:0;font-size:24px;">🟡 Service In Progress</p>
        <p style="margin:8px 0 0;font-size:13px;color:#92400E;">Work has started — you'll be notified when it's complete.</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `🚪 ${providerName} has arrived for your ${serviceName}`,
      htmlContent: emailWrapper(body),
    });
  }

  // ─── 5. Job Completed + Invoice ─────────────────────────────────────────────
  async sendJobCompleted(
    email: string,
    bookingId: string,
    serviceName: string,
    providerName: string,
    price: number,
    completedAt: string,
    customerName?: string,
    inclusions?: string[],
  ): Promise<boolean> {
    const inclusionRows = inclusions && inclusions.length > 0
      ? inclusions.map(i => `<li style="margin:4px 0;font-size:13px;color:#374151;">${i}</li>`).join('')
      : '<li style="font-size:13px;color:#374151;">Service completed as per package</li>';

    const body = `
      <div style="margin:0 0 20px;">
        <span style="background:#DCFCE7;color:#15803D;font-size:11px;font-weight:800;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Job Completed 🎉</span>
      </div>
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">
        ${customerName ? `Hi ${customerName}, ` : ''}Service completed successfully!
      </h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        Your <strong>${serviceName}</strong> has been completed. Thank you for choosing Homezy!
      </p>

      <!-- Invoice Block -->
      <div style="border:2px solid #E2E8F0;border-radius:12px;overflow:hidden;margin:0 0 20px;">
        <div style="background:#0F172A;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="margin:0;color:#ffffff;font-weight:900;font-size:14px;">SERVICE INVOICE</p>
            <p style="margin:2px 0 0;color:#94A3B8;font-size:11px;">#${bookingId.slice(-8).toUpperCase()} • ${completedAt}</p>
          </div>
          <p style="margin:0;color:#10B981;font-size:20px;font-weight:900;">₹${price}</p>
        </div>
        <div style="padding:16px 20px;">
          ${infoBox([
            { label: '🔧 Service', value: serviceName },
            { label: '👷 Professional', value: providerName },
            { label: '✅ Status', value: 'Payment Due / Collected' },
            { label: '💰 Total', value: `₹${price}` },
          ])}
          <p style="margin:12px 0 4px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Work Completed:</p>
          <ul style="margin:4px 0;padding-left:20px;">
            ${inclusionRows}
          </ul>
        </div>
      </div>

      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px;text-align:center;margin:0 0 20px;">
        <p style="margin:0;font-size:13px;color:#166534;font-weight:700;">⭐ Rate your experience</p>
        <p style="margin:6px 0 0;font-size:12px;color:#4ADE80;">Your feedback helps us maintain quality and rewards great professionals.</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `🎉 Job Done! Invoice for ${serviceName} — ₹${price}`,
      htmlContent: emailWrapper(body),
    });
  }

  // ─── 6. Cancellation ────────────────────────────────────────────────────────
  async sendBookingCancelled(
    email: string,
    bookingId: string,
    serviceName: string,
    customerName?: string,
  ): Promise<boolean> {
    const body = `
      <div style="margin:0 0 20px;">
        <span style="background:#FEE2E2;color:#B91C1C;font-size:11px;font-weight:800;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Booking Cancelled ❌</span>
      </div>
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">
        ${customerName ? `Hi ${customerName}, ` : ''}your booking has been cancelled.
      </h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        Your booking for <strong>${serviceName}</strong> (ID: #${bookingId.slice(-8).toUpperCase()}) has been cancelled successfully. No charges have been applied.
      </p>
      <p style="color:#64748B;font-size:13px;margin:0;line-height:1.6;">
        You can rebook anytime at <a href="https://homezy.in/services" style="color:#059669;font-weight:700;">homezy.in/services</a>.
      </p>
    `;
    return this.sendEmail({
      to: email,
      subject: `❌ Booking Cancelled — ${serviceName}`,
      htmlContent: emailWrapper(body),
    });
  }

  // ─── 7. Test Email ──────────────────────────────────────────────────────────
  async sendTestEmail(to: string): Promise<boolean> {
    const body = `
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;font-weight:900;">🎉 Brevo Email is Working!</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        This is a test email from your <strong>Homezy</strong> backend. Your Brevo email integration is fully configured and working correctly.
      </p>
      ${infoBox([
        { label: '✅ API Key', value: 'Connected' },
        { label: '📧 Sender', value: 'Homezy <2024903127@dmvs.ac.in>' },
        { label: '📬 Recipient', value: to },
        { label: '🕐 Sent At', value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' },
      ])}
      <p style="color:#64748B;font-size:13px;margin:20px 0 0;line-height:1.6;">
        Email automations enabled: OTP, Booking Confirmation, Provider Assigned, Provider Arrived, Job Completed (with Invoice), Cancellation.
      </p>
    `;
    return this.sendEmail({
      to,
      subject: '✅ Homezy Brevo Email — Test Successful!',
      htmlContent: emailWrapper(body),
    });
  }
}

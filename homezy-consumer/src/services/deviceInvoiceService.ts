const HOMEZY_LOGO_BASE64 = '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';

﻿import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Linking } from 'react-native';
import { format } from 'date-fns';
import { Booking, User } from '@/types/models';
import { API_BASE_URL } from './apiClient';

/**
 * On-Device Tax Invoice Generator for Homezy
 * Priority 1: Compiles official Tax Invoice PDF directly on device via expo-print & expo-sharing
 * Priority 2: Falls back seamlessly to backend /v1/bookings/:id/invoice if native print is unsupported
 */
export async function generateAndDownloadDeviceInvoice(
  booking: Booking,
  currentUser?: User | null
): Promise<{ uri?: string; invoiceNumber: string }> {
  const invoiceNumber = `HMZ-INV-${(booking.id || '1001').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  try {
    let invoiceDate = 'Today';
    try {
      invoiceDate = format(new Date(booking.createdAt || Date.now()), 'dd MMM yyyy, hh:mm a');
    } catch {}

    let scheduledDate = 'Scheduled Slot';
    try {
      if (booking.scheduledAt) {
        scheduledDate = format(new Date(booking.scheduledAt), 'dd MMM yyyy, hh:mm a');
      }
    } catch {}

    const customerName = currentUser?.name || 'Valued Customer';
    const customerPhone = currentUser?.phone || 'N/A';
    const addressLine = booking.address
      ? `${booking.address.line1 || ''}${booking.address.line2 ? ', ' + booking.address.line2 : ''}, ${booking.address.city || ''} ${booking.address.pincode || ''}`
      : 'Customer Address On File';

    const serviceName = booking.service?.name || 'Homezy Verified Professional Service';
    const categoryName = (booking.service as any)?.category?.name || 'Home Care';
    const durationMins = (booking.service as any)?.estimatedDurationMinutes || (booking.service as any)?.durationMinutes || 60;
    const providerName = booking.provider?.name || 'Verified Homezy Professional';
    const providerPhone = booking.provider?.phone || 'Assigned via Homezy App';

    const finalPrice = Number(booking.price) || 499;
    const basePrice = Number((booking.service as any)?.price) || finalPrice;
    const discount = Math.max(0, basePrice - finalPrice);
    const taxableValue = finalPrice > 0 ? (finalPrice / 1.18) : 0;
    const totalGst = finalPrice - taxableValue;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;

    const isPaid = (booking.paymentStatus || '').toUpperCase() === 'PAID';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Homezy Tax Invoice - ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
    body { background: #fff; color: #1e293b; padding: 28px; font-size: 13px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F9D58; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #0F9D58; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .brand-meta { font-size: 10px; color: #94a3b8; margin-top: 3px; }
    .badge { display: inline-block; background: #e8f5ee; color: #0F9D58; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(15,157,88,0.25); margin-bottom: 4px; }
    .inv-num { font-size: 13px; font-weight: 700; color: #0f172a; }
    .inv-date { font-size: 11px; color: #64748b; }
    .meta-cards { display: flex; gap: 14px; margin-bottom: 20px; }
    .card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
    .card-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .card-name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .card-text { font-size: 11px; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0f172a; color: #fff; text-align: left; font-size: 11px; font-weight: 600; padding: 8px 10px; }
    th.right, td.right { text-align: right; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .item-title { font-weight: 700; color: #0f172a; }
    .summary { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    .pay-box { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #fafaf9; }
    .chip { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .chip-paid { background: #ecfdf5; color: #047857; }
    .chip-pending { background: #fffbeb; color: #b45309; }
    .breakdown { width: 260px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .b-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; color: #475569; }
    .grand-total { margin-top: 8px; padding-top: 8px; border-top: 2px solid #0F9D58; display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #0f172a; }
    .grand-total .amt { color: #0F9D58; font-size: 16px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: center; gap: 14px;">
      <img src="data:image/png;base64,${HOMEZY_LOGO_BASE64}" style="width: 52px; height: 52px; object-fit: contain; border-radius: 12px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 2px;" alt="Homezy" />
      <div>
        <div class="brand-title">HOMEZY</div>
        <div class="brand-sub">Smart On-Demand Home Services & Care</div>
        <div class="brand-meta">GSTIN: 07AABCH1234F1Z5 &bull; support@homezy.in</div>
      </div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Tax Invoice</div>
      <div class="inv-num">${invoiceNumber}</div>
      <div class="inv-date">${invoiceDate}</div>
    </div>
  </div>

  <div class="meta-cards">
    <div class="card">
      <div class="card-title">Billed To (Customer)</div>
      <div class="card-name">${customerName}</div>
      <div class="card-text"><strong>Phone:</strong> ${customerPhone}</div>
      <div class="card-text"><strong>Address:</strong> ${addressLine}</div>
    </div>
    <div class="card">
      <div class="card-title">Service Details</div>
      <div class="card-name">Booking #${booking.id}</div>
      <div class="card-text"><strong>Scheduled:</strong> ${scheduledDate}</div>
      <div class="card-text"><strong>Partner:</strong> ${providerName} (${providerPhone})</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 32px;">#</th>
        <th>Service Description</th>
        <th>Category</th>
        <th>Duration</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>
          <div class="item-title">${serviceName}</div>
          <div style="font-size: 10px; color: #64748b;">100% Homezy Verified Professional Service</div>
        </td>
        <td>${categoryName}</td>
        <td>${durationMins} mins</td>
        <td class="right">&#8377; ${basePrice.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="summary">
    <div class="pay-box">
      <div class="card-title">Payment Summary</div>
      <div class="card-text"><strong>Mode:</strong> ${booking.paymentMode || 'ONLINE'}</div>
      <div class="card-text" style="margin-top: 4px;">
        <strong>Status:</strong>
        <span class="chip ${isPaid ? 'chip-paid' : 'chip-pending'}">${booking.paymentStatus || 'PENDING'}</span>
      </div>
      <div class="card-text" style="margin-top: 8px; font-size: 10px; color: #94a3b8;">
        Protected under Homezy 30-Day Service Guarantee.
      </div>
    </div>

    <div class="breakdown">
      <div class="b-row"><span>Base Amount</span><span>&#8377; ${basePrice.toFixed(2)}</span></div>
      ${discount > 0 ? `<div class="b-row" style="color:#0F9D58; font-weight:600;"><span>Promo Discount</span><span>- &#8377; ${discount.toFixed(2)}</span></div>` : ''}
      <div class="b-row"><span>Taxable Value</span><span>&#8377; ${taxableValue.toFixed(2)}</span></div>
      <div class="b-row"><span>CGST (9%)</span><span>&#8377; ${cgst.toFixed(2)}</span></div>
      <div class="b-row"><span>SGST (9%)</span><span>&#8377; ${sgst.toFixed(2)}</span></div>
      <div class="grand-total"><span>Total Paid</span><span class="amt">&#8377; ${finalPrice.toFixed(2)}</span></div>
    </div>
  </div>

  <div class="footer">
    This is a computer-generated tax invoice and does not require a physical signature.<br />
    Homezy Technologies Private Limited &bull; Cyber Hub, Gurugram, Haryana - 122002
  </div>
</body>
</html>
    `;

    // 1. Try on-device print compilation
    let printedUri: string | null = null;
    try {
      const res = await Print.printToFileAsync({ html, base64: false });
      printedUri = res.uri;
    } catch (printErr: any) {
      console.warn('[DeviceInvoiceService] On-device printToFileAsync skipped:', printErr?.message);
    }

    // 2. Try native device share
    if (printedUri) {
      try {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(printedUri, {
            UTI: 'com.adobe.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Homezy Tax Invoice - ${invoiceNumber}`,
          });
          return { uri: printedUri, invoiceNumber };
        }
      } catch (shareErr: any) {
        console.warn('[DeviceInvoiceService] Sharing sheet failed:', shareErr?.message);
      }
    }

    // 3. Fallback: Direct backend invoice download URL
    const backendInvoiceUrl = `${API_BASE_URL}/bookings/${booking.id}/invoice`;
    console.log('[DeviceInvoiceService] Opening backend invoice download:', backendInvoiceUrl);
    await Linking.openURL(backendInvoiceUrl);

    return { uri: printedUri || backendInvoiceUrl, invoiceNumber };
  } catch (error: any) {
    console.error('[DeviceInvoiceService] Error generating invoice:', error);
    // Ultimate fallback: open backend endpoint in browser
    try {
      const fallbackUrl = `${API_BASE_URL}/bookings/${booking.id}/invoice`;
      await Linking.openURL(fallbackUrl);
      return { invoiceNumber };
    } catch {
      Alert.alert(
        'Invoice Notice',
        'Could not open invoice at this moment. Please check your connection.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  }
}

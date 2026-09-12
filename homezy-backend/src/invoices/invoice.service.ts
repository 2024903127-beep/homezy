import * as fs from 'fs';
import * as path from 'path';
﻿import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

// PDFKit is a CommonJS module whose root export is the Document constructor
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoicePdf(bookingId: string): Promise<{ buffer: Buffer; filename: string }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: true,
        service: {
          include: { category: true },
        },
        address: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const invoiceNumber = booking.invoiceNumber || `HMZ-INV-${booking.id.slice(-6).toUpperCase()}`;
    if (!booking.invoiceNumber) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { invoiceNumber },
      });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    // --- Colors ---
    const primaryColor = '#10B981';
    const darkColor = '#0F172A';
    const slateColor = '#475569';
    const lightBg = '#F8FAFC';
    const borderColor = '#E2E8F0';

    // --- Header ---
    doc.rect(40, 40, 515, 65).fill(lightBg);

    // Render Brand Logo if available
    const possibleLogoPaths = [
      path.resolve(__dirname, '../../assets/logo-sm.png'),
      path.resolve(__dirname, '../../assets/logo.png'),
      'D:/Homezy/logo-sm.png',
      'D:/Homezy/logo.png',
    ];
    const logoFile = possibleLogoPaths.find((p) => fs.existsSync(p));

    if (logoFile) {
      try {
        doc.image(logoFile, 52, 48, { width: 48, height: 48 });
        doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text('HOMEZY', 110, 52);
        doc.fillColor(slateColor).fontSize(8).font('Helvetica').text('Smart On-Demand Home Services & Care', 110, 73);
        doc.text('GSTIN: 07AABCH1234F1Z5 | Support: support@homezy.in', 110, 85);
      } catch {
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('HOMEZY', 55, 52);
        doc.fillColor(slateColor).fontSize(8).font('Helvetica').text('Smart On-Demand Home Services & Care', 55, 75);
        doc.text('GSTIN: 07AABCH1234F1Z5 | Support: support@homezy.in', 55, 87);
      }
    } else {
      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('HOMEZY', 55, 52);
      doc.fillColor(slateColor).fontSize(8).font('Helvetica').text('Smart On-Demand Home Services & Care', 55, 75);
      doc.text('GSTIN: 07AABCH1234F1Z5 | Support: support@homezy.in', 55, 87);
    }

    doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', 380, 52, { align: 'right' });
    doc.fillColor(slateColor).fontSize(9).font('Helvetica').text(`Invoice #: ${invoiceNumber}`, 380, 72, { align: 'right' });
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`, 380, 85, { align: 'right' });

    doc.moveDown(2);

    // --- Billing & Booking Meta Cards ---
    const topY = 120;
    
    // Customer card
    doc.rect(40, topY, 250, 95).strokeColor(borderColor).stroke();
    doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('BILLED TO (CUSTOMER)', 50, topY + 10);
    doc.fillColor(slateColor).fontSize(9).font('Helvetica').text(`Name: ${booking.customer.name || 'Valued Customer'}`, 50, topY + 28);
    doc.text(`Phone: ${booking.customer.phone || 'N/A'}`, 50, topY + 42);
    doc.text(`Address: ${booking.address?.line1 || ''}, ${booking.address?.city || ''} ${booking.address?.pincode || ''}`, 50, topY + 56, { width: 230 });

    // Booking Details card
    doc.rect(305, topY, 250, 95).strokeColor(borderColor).stroke();
    doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('SERVICE DETAILS', 315, topY + 10);
    doc.fillColor(slateColor).fontSize(9).font('Helvetica').text(`Booking ID: ${booking.id}`, 315, topY + 28);
    doc.text(`Scheduled: ${new Date(booking.scheduledAt).toLocaleString('en-IN')}`, 315, topY + 42);
    doc.text(`Assigned Partner: ${booking.provider?.name || 'Verified Professional'}`, 315, topY + 56);
    doc.text(`Payment Mode: ${booking.paymentMode} (${booking.paymentStatus})`, 315, topY + 70);

    // --- Itemized Table ---
    const tableTop = 235;
    doc.rect(40, tableTop, 515, 24).fill(darkColor);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    doc.text('#', 50, tableTop + 7);
    doc.text('Item / Service Description', 80, tableTop + 7);
    doc.text('Category', 280, tableTop + 7);
    doc.text('Duration', 380, tableTop + 7);
    doc.text('Amount (INR)', 470, tableTop + 7, { align: 'right' });

    // Row
    const rowY = tableTop + 28;
    doc.rect(40, rowY - 4, 515, 30).fill(lightBg);
    doc.fillColor(darkColor).fontSize(9).font('Helvetica');
    doc.text('1', 50, rowY + 4);
    doc.font('Helvetica-Bold').text(booking.service.name, 80, rowY + 4);
    doc.font('Helvetica').fillColor(slateColor).text(booking.service.category?.name || 'Home Maintenance', 280, rowY + 4);
    doc.text(`${booking.service.estimatedDurationMinutes || 60} mins`, 380, rowY + 4);
    
    const basePrice = Number(booking.service.price);
    doc.fillColor(darkColor).font('Helvetica-Bold').text(`INR ${basePrice.toFixed(2)}`, 470, rowY + 4, { align: 'right' });

    // --- Totals Breakdown ---
    const totalsY = 320;
    const finalPrice = Number(booking.price);
    const discount = Math.max(0, basePrice - finalPrice);
    const taxableAmount = (finalPrice / 1.18);
    const gstAmount = finalPrice - taxableAmount;

    doc.rect(305, totalsY, 250, 115).strokeColor(borderColor).stroke();

    doc.fillColor(slateColor).fontSize(9).font('Helvetica').text('Base Amount:', 320, totalsY + 12);
    doc.text(`INR ${basePrice.toFixed(2)}`, 480, totalsY + 12, { align: 'right' });

    if (discount > 0) {
      doc.fillColor(primaryColor).text(`Coupon Discount (${booking.couponCode || 'PROMO'}):`, 320, totalsY + 28);
      doc.text(`- INR ${discount.toFixed(2)}`, 480, totalsY + 28, { align: 'right' });
    }

    doc.fillColor(slateColor).text('Taxable Value (Excl. 18% GST):', 320, totalsY + 44);
    doc.text(`INR ${taxableAmount.toFixed(2)}`, 480, totalsY + 44, { align: 'right' });

    doc.text('CGST (9%) + SGST (9%):', 320, totalsY + 60);
    doc.text(`INR ${gstAmount.toFixed(2)}`, 480, totalsY + 60, { align: 'right' });

    doc.rect(305, totalsY + 80, 250, 35).fill(primaryColor);
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('TOTAL PAID:', 320, totalsY + 92);
    doc.text(`INR ${finalPrice.toFixed(2)}`, 480, totalsY + 92, { align: 'right' });

    // --- Status Badge & Payment Info ---
    doc.rect(40, totalsY, 250, 115).strokeColor(borderColor).stroke();
    doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('PAYMENT SUMMARY', 50, totalsY + 12);
    doc.fillColor(slateColor).fontSize(9).font('Helvetica').text(`Status: ${booking.paymentStatus}`, 50, totalsY + 32);
    doc.text(`Method: ${booking.paymentMode}`, 50, totalsY + 48);
    if (booking.payment?.gatewayPaymentId) {
      doc.text(`Txn ID: ${booking.payment.gatewayPaymentId}`, 50, totalsY + 64);
    }
    doc.text('Thank you for choosing Homezy!', 50, totalsY + 85);

    // --- Footer ---
    doc.fontSize(8).fillColor(slateColor).text(
      'This is a computer generated invoice and does not require a physical signature. Homezy Services Pvt. Ltd.',
      40,
      500,
      { align: 'center', width: 515 },
    );

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(buffers);
        resolve({
          buffer,
          filename: `Homezy-Invoice-${invoiceNumber}.pdf`,
        });
      });
    });
  }
}

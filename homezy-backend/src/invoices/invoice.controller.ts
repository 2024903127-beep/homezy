import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller('bookings')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Public()
  @Get(':id/invoice')
  async downloadInvoice(@Param('id') bookingId: string, @Res() res: Response) {
    const { buffer, filename } = await this.invoiceService.generateInvoicePdf(bookingId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}

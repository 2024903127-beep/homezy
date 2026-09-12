import { Module } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import { WhatsAppService } from './whatsapp.service';

@Module({
  providers: [BrevoService, WhatsAppService],
  exports: [BrevoService, WhatsAppService],
})
export class CommunicationsModule {}

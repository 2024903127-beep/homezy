import { Body, Controller, Post, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/auth/jwt-payload.type';

@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Roles('customer')
  @Post('payment')
  initiate(@CurrentUser() user: JwtPayload, @Body('bookingId') bookingId: string) {
    return this.paymentsService.initiate(user.sub, bookingId);
  }

  @Public()
  @Post('payment/webhook')
  webhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}

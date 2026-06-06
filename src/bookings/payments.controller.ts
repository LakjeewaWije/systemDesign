import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import type { StripeWebhookDto } from './dto/stripe-webhook.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Handle Stripe payment events for bookings' })
  async handleStripeWebhook(@Body() event: StripeWebhookDto) {
    await this.bookingsService.handleStripeWebhook(event);

    return { received: true };
  }
}

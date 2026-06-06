import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

type StripePaymentIntent = {
  id: string;
  client_secret: string | null;
  status: string;
};

@Injectable()
export class StripePaymentsService {
  constructor(private readonly configService: ConfigService) {}

  getBookingPaymentAmount(): number {
    return Number(this.configService.get('stripe.bookingAmount'));
  }

  getBookingPaymentCurrency(): string {
    return String(this.configService.get('stripe.currency')).toLowerCase();
  }

  async createPaymentIntent(input: {
    amount: number;
    currency: string;
    idempotencyKey: string;
    bookingId: string;
    patientId: string;
  }): Promise<StripePaymentIntent> {
    const secretKey = this.configService.get<string>('stripe.secretKey');

    if (!secretKey) {
      throw new BadRequestException('Stripe secret key is not configured');
    }

    const stripe = new Stripe(secretKey);

    try {
      return await stripe.paymentIntents.create(
        {
          amount: input.amount,
          currency: input.currency,
          metadata: {
            bookingId: input.bookingId,
            patientId: input.patientId,
          },
        },
        {
          idempotencyKey: input.idempotencyKey,
        },
      );
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}

export type StripeWebhookDto = {
  type: string;
  data?: {
    object?: {
      id?: string;
      status?: string;
    };
  };
};

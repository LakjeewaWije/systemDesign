export default () => ({
  app: {
    env: process.env.ENV,
    port: process.env.APP_PORT,
    secret: process.env.SECRET,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  firebase: {
    googleScopeUrl: process.env.GOOGLE_SCOPE_URL,
    fcmUrl: process.env.FCM_URL,
    serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
    serviceAccountJson: process.env.SERVICE_ACCOUNT_JSON,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    bookingAmount: process.env.BOOKING_PAYMENT_AMOUNT_CENTS ?? '5000',
    currency: process.env.BOOKING_PAYMENT_CURRENCY ?? 'usd',
  },
});

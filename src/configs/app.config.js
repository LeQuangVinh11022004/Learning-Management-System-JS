module.exports = {
  ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3200),
  SHUTDOWN_TIMEOUT_MS: Number(process.env.SHUTDOWN_TIMEOUT_MS || 10000),
  MongoDB_URL_DEV: process.env.MONGODB_URL_DEV,
  MongoDB_URL_MAIN: process.env.MONGODB_URL_MAIN,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? Array.from(
        new Set(
          process.env.CORS_ORIGINS.split(',')
            .map((origin) => origin.trim())
            .filter(Boolean)
        )
      )
    : [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3200',
      ],
  email: {
    name: 'hello',
    host: process.env.EMAIL_HOST ?? 'sandbox.smtp.mailtrap.io',
    port: process.env.EMAIL_PORT ?? 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },

  JWT: {
    secretKey: process.env.JWT_SECRET_KEY,
    accessTokenLife: '1d', // 1 day
    refreshTokenLife: '7d', // 7 days
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_SECURE_SECRET,
  },
  imgur: {
    clientID: process.env.IMGUR_CLIENT_ID,
  },
};

export default () => ({
  port: process.env.PORT,

  docs: {
    enabled: process.env.DOCS_ENABLED === 'true' || false,
    path: process.env.DOCS_PATH || 'docs',
  },

  bullboard: {
    enabled: process.env.BULLBOARD_ENABLED === 'true' || false,
    path: process.env.BULLBOARD_PATH || 'queues',
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },

  database: {
    url: process.env.DATABASE_URL,
    logging: process.env.DATABASE_LOGGING === 'true',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  },

  mailSender: process.env.MAIL_SENDER,

  weatherApiKey: process.env.WEATHER_API_KEY,
});

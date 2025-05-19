export default () => ({
  port: process.env.PORT,

  deployedUrl: process.env.DEPLOYED_URL,

  docs: {
    enabled: process.env.DOCS_ENABLED === 'true' || false,
    path: process.env.DOCS_PATH || 'docs',
  },

  bullboard: {
    enabled: process.env.BULLBOARD_ENABLED === 'true' || false,
    path: process.env.BULLBOARD_PATH || 'queues',
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  database: {
    url: process.env.DATABASE_URL,
    logging: process.env.DATABASE_LOGGING === 'true',
    migrationsRun: process.env.DB_MIGRATE === 'true',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_REQUIRE_TLS === 'true',
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  },

  mailSender: process.env.MAIL_SENDER,

  weatherApiKey: process.env.WEATHER_API_KEY,
});

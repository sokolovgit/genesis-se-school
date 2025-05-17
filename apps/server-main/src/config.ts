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

  weatherApiKey: process.env.WEATHER_API_KEY,
});

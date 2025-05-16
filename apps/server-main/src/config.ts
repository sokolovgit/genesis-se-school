export default () => ({
  port: process.env.PORT,

  docs: {
    enabled: process.env.DOCS_ENABLED === 'true' || false,
    path: process.env.DOCS_PATH || 'docs',
  },

  database: {
    url: process.env.DATABASE_URL,
    logging: process.env.DATABASE_LOGGING === 'true',
  },
});

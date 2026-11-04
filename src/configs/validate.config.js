const validateConfig = (config) => {
  const errors = [];
  const databaseUrl =
    config.ENV === 'development'
      ? config.MongoDB_URL_DEV
      : config.MongoDB_URL_MAIN;

  if (!Number.isInteger(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT must be an integer between 1 and 65535');
  }

  if (
    !Number.isSafeInteger(config.SHUTDOWN_TIMEOUT_MS) ||
    config.SHUTDOWN_TIMEOUT_MS <= 0
  ) {
    errors.push('SHUTDOWN_TIMEOUT_MS must be a positive integer');
  }

  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    errors.push(
      `Missing database URL for ${config.ENV} environment`
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid application configuration: ${errors.join('; ')}`);
  }
};

module.exports = validateConfig;

require('dotenv').config();

const config = require('./configs/app.config');
const logger = require('./configs/logger.config');
const db = require('./configs/db.config');
const closeServer = require('./utils/closeServer');

const startServer = async () => {
  await db.connect();

  const createApp = require('./app');
  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info(`Server is running at http://localhost:${config.PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`${signal} received; shutting down`);

    try {
      const forcedClose = await closeServer(
        server,
        config.SHUTDOWN_TIMEOUT_MS
      );
      if (forcedClose) {
        logger.warn('Graceful shutdown timed out; active connections were closed');
      }
    } catch (error) {
      logger.error('Failed to close the HTTP server', error);
      process.exitCode = 1;
    }

    try {
      await db.disconnect();
      logger.info('Server shut down successfully');
    } catch (disconnectError) {
      logger.error('Failed to disconnect from the database', disconnectError);
      process.exitCode = 1;
    }
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  const handleFatalError = (error) => {
    logger.error('Unexpected application error', error);
    process.exitCode = 1;
    void shutdown('fatal error');
  };

  process.once('uncaughtException', handleFatalError);
  process.once('unhandledRejection', handleFatalError);

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Application failed to start', error);
    process.exitCode = 1;
  });
}

module.exports = startServer;

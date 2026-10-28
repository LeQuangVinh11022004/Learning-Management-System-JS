require('dotenv').config();

const config = require('./configs/app.config');
const logger = require('./configs/logger.config');
const db = require('./configs/db.config');

const startServer = async () => {
  await db.connect();

  const createApp = require('./app');
  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info(`Server is running at http://localhost:${config.PORT}`);
    logger.info(`API Docs: http://localhost:${config.PORT}/api-docs`);
  });

  let isShuttingDown = false;
  const shutdown = (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`${signal} received; shutting down`);

    server.close(async (error) => {
      if (error) {
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
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  const handleFatalError = (error) => {
    logger.error('Unexpected application error', error);
    process.exitCode = 1;
    shutdown('fatal error');
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

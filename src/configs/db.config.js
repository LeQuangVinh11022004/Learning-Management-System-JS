const logger = require('./logger.config');
const config = require('./app.config');
const mongoose = require('mongoose');
// mongoose.plugin(require('../models/plugins/toJSON.plugin'));
const DB_URL =
  config.ENV === 'development'
    ? config.MongoDB_URL_DEV
    : config.MongoDB_URL_MAIN;

async function connect() {
  try {
    if (!DB_URL) {
      throw new Error(`Missing database URL for ${config.ENV} environment`);
    }

    await mongoose.connect(DB_URL);
    logger.info('Connect to database successfully');
    logger.info(`ENV: ${config.ENV}`);
  } catch (error) {
    logger.error('Connect to database failed', error);
    throw error;
  }
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = {
  connect,
  disconnect,
};

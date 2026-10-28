const express = require('express');
const helmet = require('helmet');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const config = require('./configs/app.config');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
const APIError = require('./utils/APIError');

const createApp = () => {
  const app = express();
  const corsOptions = {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3200',
      config.CLIENT_URL,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(ExpressMongoSanitize());
  app.use(compression());
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;
    return res.status(isDatabaseConnected ? 200 : 503).json({
      status: isDatabaseConnected ? 'ok' : 'unavailable',
      database: isDatabaseConnected ? 'connected' : 'disconnected',
    });
  });

  app.get('/', (req, res) => {
    return res.send('Learning Management System API');
  });

  app.use((req, res, next) => {
    next(new APIError(404, 'Not found'));
  });

  app.use(errorConverter);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;

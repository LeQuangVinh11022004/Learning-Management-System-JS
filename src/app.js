const express = require('express');
const helmet = require('helmet');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const config = require('./configs/app.config');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
const requestId = require('./middlewares/requestId.middleware');
const APIError = require('./utils/APIError');

const createApp = () => {
  const app = express();
  morgan.token('request-id', (req) => req.id);
  const corsOptions = {
    origin: config.CORS_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(requestId);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(ExpressMongoSanitize());
  app.use(compression());
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(morgan(':request-id :method :url :status :response-time ms'));

  app.get('/health/live', (req, res) => {
    return res.status(200).json({ status: 'alive' });
  });

  app.get(['/health', '/health/ready'], (req, res) => {
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

const mongoose = require('mongoose');
const config = require('../configs/app.config');
const logger = require('../configs/logger.config');
const ApiError = require('../utils/APIError');

const errorConverter = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return next(err);
  }

  let statusCode = 500;
  if (err.code === 11000) {
    statusCode = 409;
  } else if (err instanceof mongoose.Error) {
    statusCode = 400;
  } else if (Number.isInteger(err.statusCode)) {
    statusCode = err.statusCode;
  } else if (Number.isInteger(err.status)) {
    statusCode = err.status;
  }

  return next(
    new ApiError(statusCode, err.message || 'Something went wrong', err.stack)
  );
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message =
    statusCode >= 500 && config.ENV !== 'development'
      ? 'Internal server error'
      : err.message;

  res.locals.errorMessage = message;
  const response = {
    code: statusCode,
    message,
    ...(config.ENV === 'development' && err.stack && { stack: err.stack }),
  };
  logger.error(err.stack || err.message || err);

  return res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};

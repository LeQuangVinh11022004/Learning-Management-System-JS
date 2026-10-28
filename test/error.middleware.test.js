const { after, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const APIError = require('../src/utils/APIError');
const logger = require('../src/configs/logger.config');
const { errorConverter } = require('../src/middlewares/error.middleware');

after(() => {
  logger.close();
});

const convertError = (error) => {
  let convertedError;
  errorConverter(error, {}, {}, (nextError) => {
    convertedError = nextError;
  });
  return convertedError;
};

test('preserves application error status codes', () => {
  const error = new APIError(403, 'Forbidden');

  assert.equal(convertError(error), error);
});

test('preserves HTTP status codes from middleware errors', () => {
  const error = new Error('Not found');
  error.status = 404;

  assert.equal(convertError(error).statusCode, 404);
});

test('maps Mongoose errors to bad requests', () => {
  const error = new mongoose.Error.CastError('ObjectId', 'invalid', '_id');

  assert.equal(convertError(error).statusCode, 400);
});

test('maps duplicate key errors to conflicts', () => {
  const error = new Error('Duplicate key');
  error.code = 11000;

  assert.equal(convertError(error).statusCode, 409);
});

test('maps unexpected errors to internal server errors', () => {
  assert.equal(convertError(new Error('Unexpected')).statusCode, 500);
});

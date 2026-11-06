const test = require('node:test');
const assert = require('node:assert/strict');
const validateConfig = require('../src/configs/validate.config');

const validConfig = {
  ENV: 'development',
  PORT: 3200,
  SHUTDOWN_TIMEOUT_MS: 10000,
  MongoDB_URL_DEV: 'mongodb://127.0.0.1:27017/lms',
  MongoDB_URL_MAIN: 'mongodb://127.0.0.1:27017/lms-production',
  CORS_ORIGINS: ['http://localhost:5173', 'https://lms.example'],
};

test('accepts valid runtime configuration', () => {
  assert.doesNotThrow(() => validateConfig(validConfig));
});

test('rejects ports outside the valid TCP range', () => {
  assert.throws(
    () => validateConfig({ ...validConfig, PORT: 65536 }),
    /PORT must be an integer between 1 and 65535/
  );
});

test('rejects non-numeric ports', () => {
  assert.throws(
    () => validateConfig({ ...validConfig, PORT: 'not-a-port' }),
    /PORT must be an integer between 1 and 65535/
  );
});

test('rejects non-positive shutdown timeouts', () => {
  assert.throws(
    () => validateConfig({ ...validConfig, SHUTDOWN_TIMEOUT_MS: 0 }),
    /SHUTDOWN_TIMEOUT_MS must be a positive integer/
  );
});

test('requires a database URL for the active environment', () => {
  assert.throws(
    () => validateConfig({ ...validConfig, MongoDB_URL_DEV: undefined }),
    /Missing database URL for development environment/
  );
});

test('accepts multiple valid HTTP and HTTPS CORS origins', () => {
  assert.doesNotThrow(() =>
    validateConfig({
      ...validConfig,
      CORS_ORIGINS: ['http://localhost:3200', 'https://lms.example'],
    })
  );
});

test('rejects CORS origins that include a path', () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        CORS_ORIGINS: ['https://lms.example/api'],
      }),
    /CORS_ORIGINS\[0\] must be an HTTP\(S\) origin without a path/
  );
});

test('rejects non-HTTP CORS origins', () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        CORS_ORIGINS: ['file://localhost'],
      }),
    /CORS_ORIGINS\[0\] must be an HTTP\(S\) origin without a path/
  );
});

test('requires at least one CORS origin', () => {
  assert.throws(
    () => validateConfig({ ...validConfig, CORS_ORIGINS: [] }),
    /CORS_ORIGINS must contain at least one allowed origin/
  );
});

test('reports multiple configuration errors together', () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        PORT: -1,
        SHUTDOWN_TIMEOUT_MS: -1,
        MongoDB_URL_DEV: undefined,
        CORS_ORIGINS: ['https://example.com/path'],
      }),
    (error) => {
      assert.match(error.message, /PORT must be an integer/);
      assert.match(error.message, /SHUTDOWN_TIMEOUT_MS must be a positive integer/);
      assert.match(error.message, /Missing database URL/);
      assert.match(error.message, /CORS_ORIGINS\[0\]/);
      return true;
    }
  );
});

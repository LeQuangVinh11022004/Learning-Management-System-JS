const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const createRateLimiter = require('../src/middlewares/rateLimit.middleware');
const requestId = require('../src/middlewares/requestId.middleware');

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(requestId);
  app.use(createRateLimiter({ windowMs: 60000, maxRequests: 2 }));
  app.get('/health/live', (req, res) => res.json({ status: 'alive' }));
  app.get('/resource', (req, res) => res.json({ status: 'ok' }));

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  const serverClosed = new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  server.closeAllConnections();
  await serverClosed;
});

test('returns 429 with request ID after the configured request limit', async () => {
  const firstResponse = await fetch(`${baseUrl}/resource`);
  const secondResponse = await fetch(`${baseUrl}/resource`);
  const limitedResponse = await fetch(`${baseUrl}/resource`);
  const body = await limitedResponse.json();

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.equal(limitedResponse.status, 429);
  assert.equal(body.code, 429);
  assert.equal(body.requestId, limitedResponse.headers.get('x-request-id'));
  assert.ok(limitedResponse.headers.has('retry-after'));
});

test('does not rate-limit health checks', async () => {
  const response = await fetch(`${baseUrl}/health/live`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'alive' });
});

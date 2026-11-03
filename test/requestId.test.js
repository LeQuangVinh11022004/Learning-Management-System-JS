const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const originalCorsOrigins = process.env.CORS_ORIGINS;
process.env.CORS_ORIGINS = 'https://lms.example';
const createApp = require('../src/app');
const logger = require('../src/configs/logger.config');
if (originalCorsOrigins === undefined) {
  delete process.env.CORS_ORIGINS;
} else {
  process.env.CORS_ORIGINS = originalCorsOrigins;
}

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  const serverClosed = new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  server.closeAllConnections();
  await serverClosed;
  logger.close();
});

test('returns a unique request ID response header', async () => {
  const firstResponse = await fetch(`${baseUrl}/`);
  const secondResponse = await fetch(`${baseUrl}/`);
  const firstRequestId = firstResponse.headers.get('x-request-id');
  const secondRequestId = secondResponse.headers.get('x-request-id');

  assert.match(firstRequestId, /^[0-9a-f-]{36}$/i);
  assert.match(secondRequestId, /^[0-9a-f-]{36}$/i);
  assert.notEqual(firstRequestId, secondRequestId);
});

test('includes the request ID in error responses', async () => {
  const response = await fetch(`${baseUrl}/missing`);
  const requestId = response.headers.get('x-request-id');
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.requestId, requestId);
});

test('reports process liveness independently of database readiness', async () => {
  const response = await fetch(`${baseUrl}/health/live`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'alive' });
});

test('keeps the legacy health endpoint as a readiness alias', async () => {
  const legacyResponse = await fetch(`${baseUrl}/health`);
  const readyResponse = await fetch(`${baseUrl}/health/ready`);
  const legacyBody = await legacyResponse.json();
  const readyBody = await readyResponse.json();

  assert.equal(legacyResponse.status, readyResponse.status);
  assert.deepEqual(legacyBody, readyBody);
  assert.equal(readyBody.database, 'disconnected');
});

test('allows configured CORS origins and omits unconfigured origins', async () => {
  const allowedResponse = await fetch(`${baseUrl}/`, {
    headers: { Origin: 'https://lms.example' },
  });
  const deniedResponse = await fetch(`${baseUrl}/`, {
    headers: { Origin: 'https://untrusted.example' },
  });

  assert.equal(
    allowedResponse.headers.get('access-control-allow-origin'),
    'https://lms.example'
  );
  assert.equal(deniedResponse.headers.get('access-control-allow-origin'), null);
});

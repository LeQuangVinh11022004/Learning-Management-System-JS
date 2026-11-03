const test = require('node:test');
const assert = require('node:assert/strict');
const closeServer = require('../src/utils/closeServer');

test('closes the server gracefully before the timeout', async () => {
  let closed = false;
  const server = {
    close(callback) {
      closed = true;
      callback();
    },
  };

  const forcedClose = await closeServer(server, 100);

  assert.equal(closed, true);
  assert.equal(forcedClose, false);
});

test('closes active connections after the shutdown timeout', async () => {
  let closeCallback;
  let forced = false;
  const server = {
    close(callback) {
      closeCallback = callback;
    },
    closeAllConnections() {
      forced = true;
      closeCallback();
    },
  };

  const forcedClose = await closeServer(server, 10);

  assert.equal(forced, true);
  assert.equal(forcedClose, true);
});

test('rejects invalid shutdown timeouts', async () => {
  const server = {
    close() {
      assert.fail('Server must not close with an invalid timeout');
    },
  };

  await assert.rejects(
    closeServer(server, 0),
    /Shutdown timeout must be a positive number/
  );
});

const closeServer = (server, timeoutMs) =>
  new Promise((resolve, reject) => {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      reject(new RangeError('Shutdown timeout must be a positive number'));
      return;
    }

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      if (typeof server.closeAllConnections !== 'function') {
        reject(
          new Error('HTTP server does not support closing active connections')
        );
        return;
      }

      try {
        server.closeAllConnections();
      } catch (error) {
        reject(error);
      }
    }, timeoutMs);

    server.close((error) => {
      clearTimeout(timer);
      if (error) {
        reject(error);
        return;
      }
      resolve(timedOut);
    });
  });

module.exports = closeServer;

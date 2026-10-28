const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const transports = [new winston.transports.Console()];

if (process.env.ELASTICSEARCH_URL) {
  transports.push(
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
    })
  );
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

module.exports = winston.createLogger({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp({
      format: 'DD/MM HH:mm:ss',
    }),
    winston.format.colorize(),
    winston.format.printf((log) => {
      if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
      return `[${log.timestamp}] [${log.level}] ${log.message}`;
    })
  ),
  transports,
});

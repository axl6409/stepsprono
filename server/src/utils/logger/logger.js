const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const errorTransport = new transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const warningTransport = new transports.DailyRotateFile({
  filename: 'logs/warning-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'warning',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const infoTransport = new transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'StepsProno' },
  transports: [
    errorTransport,
    warningTransport,
    infoTransport
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

module.exports = logger;

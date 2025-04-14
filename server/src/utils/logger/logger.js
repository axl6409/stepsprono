const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors, splat, json, colorize, align, printf } = format;
const path = require('path');
require('winston-daily-rotate-file');

const errorTransport = new transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '4d'
});

const warningTransport = new transports.DailyRotateFile({
  filename: path.join('logs', 'warning-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'warning',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '4d'
});

const infoTransport = new transports.DailyRotateFile({
  filename: path.join('logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '4d'
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    errors({ stack: true }),
    splat(),
    json(),
    align(),
    printf(info => `[${info.timestamp}] ${info.level} [StepsProno]: ${info.message}`)
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
    format: combine(
      colorize(),
      format.simple()
    )
  }));
}

module.exports = logger;

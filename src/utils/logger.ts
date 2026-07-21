import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    return `[${info.timestamp}] [${String(info.level).toUpperCase()}]: ${info.message}${info.stack ? `\nStack: ${info.stack}` : ''}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

export function logRequest(method: string, url: string, statusCode: number, durationMs: number) {
  logger.info(`HTTP ${method} ${url} - Status: ${statusCode} - Duration: ${durationMs}ms`);
}

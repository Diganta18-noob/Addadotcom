import winston from 'winston';

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    return `[${info.timestamp}] [${String(info.level).toUpperCase()}]: ${info.message}${info.stack ? `\nStack: ${info.stack}` : ''}`;
  })
);

// In Vercel serverless / production environments, write ONLY to Console.
// Never attempt to write to local filesystem with winston.transports.File.
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    ),
  }),
];

// Only write to files in local development if NOT on Vercel / serverless
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && typeof window === 'undefined') {
  try {
    // Dynamic require so bundler does not bundle fs write streams for edge/serverless
    const path = require('path');
    const fs = require('fs');
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
      })
    );
  } catch {
    // Ignore file logger initialization error in restricted environments
  }
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
});

export function logRequest(method: string, url: string, statusCode: number, durationMs: number) {
  logger.info(`HTTP ${method} ${url} - Status: ${statusCode} - Duration: ${durationMs}ms`);
}

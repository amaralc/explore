import { createLogger, format, transports } from 'winston';
import { ApplicationLogger, ILogMetadata } from './application-logger';

// Define the log file path
const logFilePath = process.env['LOG_FILE_PATH'] || 'output.log';

const logLevels = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const myFormat = () =>
  format.combine(
    format.printf(({ timestamp, level, message }) => {
      const parsedMessage = JSON.parse(message);
      return JSON.stringify({
        level,
        timestamp,
        ...parsedMessage,
        memoryUsage: process.memoryUsage(),
      });
    }),
  );

// Create a logger instance
const logger = createLogger({
  levels: logLevels,
  format: myFormat(),
  transports: [
    // - Write all logs with importance level of `info` or less to `combined.log`
    new transports.File({ filename: logFilePath }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.Console({
      format: myFormat(),
    }),
  );
}

export class WinstonLogger implements ApplicationLogger {
  info(message: string, metadata?: ILogMetadata): void {
    logger.info(JSON.stringify({ message, ...(metadata ?? {}) }));
  }

  error(message: string, metadata?: ILogMetadata): void {
    logger.error(JSON.stringify({ level: 'error', message, ...(metadata ?? {}), memoryUsage: process.memoryUsage() }));
  }

  warn(message: string, metadata?: ILogMetadata): void {
    logger.warning(JSON.stringify({ level: 'warn', message, ...(metadata ?? {}), memoryUsage: process.memoryUsage() }));
  }
}

export const winstonLogger = new WinstonLogger();

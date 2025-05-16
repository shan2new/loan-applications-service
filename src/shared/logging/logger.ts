import pino from 'pino';
import { env } from '../config/env';

// Configure default logger
const pinoConfig: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
        },
      }
    : {}),
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
};

// Create and export the logger
export const logger = pino(pinoConfig);

// Create a child logger with context
export function createLogger(context: string) {
  return logger.child({ context });
}

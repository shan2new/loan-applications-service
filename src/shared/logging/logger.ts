import pino from 'pino';

const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV !== 'production'
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

// Update logger level if needed
export function updateLoggerLevel(level: string): void {
  logger.level = level;
}

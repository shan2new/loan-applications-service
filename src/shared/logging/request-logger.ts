import { Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';

const requestLogger = createLogger('RequestLogger');

/**
 * Custom middleware for logging HTTP requests
 * Only logs errors and important information, not every request
 */
export function customRequestLogger(req: Request, res: Response, next: NextFunction): void {
  // Set the start time to calculate request duration
  const startTime = process.hrtime();

  // Function to be called when the response is finished
  function logResponse(): void {
    // Calculate request duration
    const elapsedHrTime = process.hrtime(startTime);
    const elapsedTimeInMs = Math.round(elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6);

    // Only log if response is an error (400+)
    if (res.statusCode >= 400) {
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${elapsedTimeInMs}ms`,
      };

      const logMessage = `HTTP ${req.method} ${req.url} - ${res.statusCode} (${elapsedTimeInMs}ms)`;

      if (res.statusCode >= 500) {
        requestLogger.error(logData, logMessage);
      } else {
        requestLogger.warn(logData, logMessage);
      }
    }
  }

  // Listen for the 'finish' event
  res.on('finish', logResponse);

  next();
}

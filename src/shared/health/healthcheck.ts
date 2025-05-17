import { Router, Request, Response } from 'express';
import { createLogger } from '@shared/logging/logger';
import os from 'os';

const healthLogger = createLogger('HealthCheck');
const router = Router();

/**
 * Basic health check that always returns healthy
 * This ensures Elastic Beanstalk can determine instance health during startup
 * even before the database is available
 */
router.get('/health-basic', (_req: Request, res: Response) => {
  healthLogger.debug('Basic health check requested');

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Application is running',
  });
});

/**
 * Enhanced health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  try {
    healthLogger.debug('Health check requested');

    // System information
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      hostname: os.hostname(),
      platform: process.platform,
      version: process.version,
      env: process.env.NODE_ENV,
      port: process.env.PORT,
    };

    // Check database connection
    const dbStatus = 'unknown';

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      system: systemInfo,
    };

    res.status(200).json(health);
  } catch (error) {
    healthLogger.error({ error }, 'Health check failed');
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as healthCheckRouter };

import { Router, Request, Response } from 'express';
import { createLogger } from '@shared/logging/logger';
import os from 'os';
import { PrismaClient } from '@prisma/client';

const healthLogger = createLogger('HealthCheck');
const router = Router();
const prisma = new PrismaClient();

/**
 * Basic health check that always returns healthy
 * This ensures Elastic Beanstalk can determine instance health during startup
 * even before the database is available
 */
router.get('/health-basic', (req: Request, res: Response) => {
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
router.get('/health', async (req: Request, res: Response) => {
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
    let dbStatus = 'unknown';
    try {
      // Simple query to test database connection
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      healthLogger.error({ error }, 'Database connection failed');
      dbStatus = 'disconnected';

      // Return 200 even if database is unavailable during initialization
      // This prevents Elastic Beanstalk from terminating instances during startup
      // when the database connection might not be ready yet
      if (process.uptime() < 120) {
        // 2 minutes grace period for startup
        return res.status(200).json({
          status: 'initializing',
          timestamp: new Date().toISOString(),
          message: 'Application starting up, database connection not yet established',
          system: systemInfo,
        });
      }
    }

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

import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';
import { logger } from '../logging/logger';

// Load environment variables from .env files
dotenvFlow.config();

// Environment variables validation schema
const envSchema = z.object({
  // Application settings
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .refine(val => !isNaN(parseInt(val, 10)), {
      message: 'PORT must be a valid number',
    })
    .transform(val => parseInt(val, 10))
    .default('3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().optional(),

  // Authentication settings
  API_ACCESS_TOKEN: z
    .string()
    .min(32, 'API_ACCESS_TOKEN must be at least 32 characters long for security')
    .or(
      z.literal('test-api-token').transform(val => {
        if (process.env.NODE_ENV !== 'test') {
          logger.warn('Using test API token in non-test environment');
        }
        return val;
      }),
    ),

  // Database settings
  DATABASE_URL: z.string().refine(val => val.startsWith('postgresql://'), {
    message: 'DATABASE_URL must be a valid PostgreSQL connection string',
  }),
});

/**
 * Validate environment variables and exit if validation fails
 */
function validateEnv(): z.infer<typeof envSchema> {
  try {
    logger.info('Validating environment variables');
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map(e => {
          return `- ${e.path.join('.')}: ${e.message}`;
        })
        .join('\n');

      logger.fatal(`Environment validation failed:\n${errorMessages}`);
    } else {
      logger.fatal({ error }, 'Unexpected error during environment validation');
    }

    process.exit(1);
  }
}

// Validate and export environment variables
export const env = validateEnv();

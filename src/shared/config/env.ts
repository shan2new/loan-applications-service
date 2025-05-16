import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

// Load environment variables from .env files
dotenvFlow.config();

// Environment variables validation schema
const envSchema = z.object({
  // Application settings
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().optional(),

  // Authentication settings
  API_ACCESS_TOKEN: z.string(),

  // Database settings
  DATABASE_URL: z.string(),
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);

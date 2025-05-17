import { PrismaClient } from '@prisma/client';
import { Application } from '../src/core/app';
import { LoanModule } from '../src/modules/loan';
import request from 'supertest';
import { Express } from 'express';

// Default test API token for tests
export const TEST_API_TOKEN = 'test-api-token';

// Check if we're running in CI environment
const isCI = process.env.CI === 'true' || process.env.CODEBUILD_BUILD_ID !== undefined;

// Use a dedicated PrismaClient for tests with the test database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/loan_applications_test?schema=public',
    },
  },
});

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.API_ACCESS_TOKEN = TEST_API_TOKEN;

// Create a fully configured Express app for testing
export const setupTestApp = async () => {
  // Create the application
  const app = new Application();

  // Register modules
  app.registerModules([LoanModule]);

  // Initialize the application
  await app.initialize();

  // Return the Express app instance for testing
  return app.getExpressApp();
};

/**
 * Creates a supertest request with authentication headers
 * @param app Express application
 * @returns Supertest instance with auth headers
 */
export const authenticatedRequest = (app: Express) => {
  return {
    get: (url: string) => request(app).get(url).set('x-access-token', TEST_API_TOKEN),
    post: (url: string) => request(app).post(url).set('x-access-token', TEST_API_TOKEN),
    put: (url: string) => request(app).put(url).set('x-access-token', TEST_API_TOKEN),
    patch: (url: string) => request(app).patch(url).set('x-access-token', TEST_API_TOKEN),
    delete: (url: string) => request(app).delete(url).set('x-access-token', TEST_API_TOKEN),
  };
};

export class TestDatabase {
  private static _instance: TestDatabase;
  private _cleanup: (() => Promise<void>) | null = null;

  private constructor() {}

  static getInstance(): TestDatabase {
    if (!TestDatabase._instance) {
      TestDatabase._instance = new TestDatabase();
    }
    return TestDatabase._instance;
  }

  async setup() {
    // Skip actual database operations if in CI environment
    if (isCI) {
      console.log('Running in CI environment - skipping database operations');
      return;
    }

    try {
      // First ensure the database is connected
      await prisma.$connect();

      // Set the cleanup function
      this._cleanup = async () => {
        await prisma.$disconnect();
      };

      // Clear any existing data
      await this.resetDatabase();
    } catch (error) {
      console.error('Error setting up test database:', error);
      throw error;
    }
  }

  async teardown() {
    if (isCI) {
      return;
    }

    if (this._cleanup) {
      await this._cleanup();
      this._cleanup = null;
    }
  }

  async resetDatabase(): Promise<void> {
    if (isCI) {
      return;
    }

    try {
      // Delete all data from tables in the correct order to respect foreign key constraints
      await prisma.$transaction([
        prisma.$executeRaw`DELETE FROM "loan_applications"`,
        prisma.$executeRaw`DELETE FROM "customers"`,
      ]);
    } catch (error) {
      console.error('Error resetting test database:', error);
    }
  }
}

// For direct database operations in tests
export { prisma };

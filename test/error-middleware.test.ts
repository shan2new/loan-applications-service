import request from 'supertest';
import express, { Express, Router, Request, Response, NextFunction } from 'express';
import { TestDatabase } from './test-utils';
import {
  ApplicationError,
  UnauthorizedError,
  ForbiddenError,
} from '../src/shared/errors/application-error';
import { ValidationError } from '../src/shared/errors/validation-error';
import { errorHandler } from '../src/shared/errors/error-middleware';
import { ZodIssue } from 'zod';

describe('Error Middleware', () => {
  let app: Express;
  const testDb = TestDatabase.getInstance();

  // Set up the test database and app once before all tests
  beforeAll(async () => {
    await testDb.setup();

    // Create a test app with routes that will throw specific errors
    const expressApp = express();
    expressApp.use(express.json());

    const router = Router();

    // Route that throws a ValidationError with simple error format
    router.get('/test/validation-error', (_req: Request, _res: Response, next: NextFunction) => {
      // Mock Zod errors with simplified structure to avoid complex Zod error typings
      const errors: Partial<ZodIssue>[] = [
        {
          code: 'custom',
          path: ['email'],
          message: 'Invalid email format',
        },
        {
          code: 'custom',
          path: ['name'],
          message: 'Name is required',
        },
      ];

      const validationError = new ValidationError('Validation failed', errors as ZodIssue[]);
      next(validationError);
    });

    // Route that throws an ApplicationError
    router.get('/test/application-error', (_req: Request, _res: Response, next: NextFunction) => {
      const appError = new ApplicationError('Resource not found', 404);
      next(appError);
    });

    // Route that throws an UnauthorizedError (authentication error)
    router.get('/test/unauthorized-error', (_req: Request, _res: Response, next: NextFunction) => {
      const authError = new UnauthorizedError('Authentication token is required');
      next(authError);
    });

    // Route that throws a ForbiddenError (authorization error)
    router.get('/test/forbidden-error', (_req: Request, _res: Response, next: NextFunction) => {
      const forbiddenError = new ForbiddenError('Insufficient permissions');
      next(forbiddenError);
    });

    // Route that throws an unhandled error
    router.get('/test/unhandled-error', (_req: Request, _res: Response, next: NextFunction) => {
      const error = new Error('Something went wrong unexpectedly');
      next(error);
    });

    // Attach the router
    expressApp.use(router);

    // Add the error middleware we want to test
    expressApp.use(errorHandler);

    app = expressApp;
  });

  // Clean up after all tests
  afterAll(async () => {
    await testDb.teardown();
  });

  describe('Validation Error Handling', () => {
    it('should format validation errors correctly', async () => {
      const response = await request(app).get('/test/validation-error').expect(400); // ValidationError has a 400 status code

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.errors).toBeInstanceOf(Array);
      expect(response.body.error.errors.length).toBe(2);

      // Check specific validation errors
      const errorPaths = response.body.error.errors.map((e: { path: string[] }) =>
        e.path.join('.'),
      );
      expect(errorPaths).toContain('email');
      expect(errorPaths).toContain('name');
    });
  });

  describe('Application Error Handling', () => {
    it('should format application errors correctly', async () => {
      const response = await request(app).get('/test/application-error').expect(404); // This ApplicationError has a 404 status code

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe('Resource not found');
      expect(response.body.error.errors).toBeUndefined(); // ApplicationError doesn't have errors array
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle unauthorized errors with 401 status', async () => {
      const response = await request(app).get('/test/unauthorized-error').expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe('Authentication token is required');
    });

    it('should handle forbidden errors with 403 status', async () => {
      const response = await request(app).get('/test/forbidden-error').expect(403);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe('Insufficient permissions');
    });
  });

  describe('Unhandled Error Handling', () => {
    it('should handle unhandled errors with 500 status', async () => {
      // First, store the original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;

      // Test in development mode first (shows actual error message)
      process.env.NODE_ENV = 'dev';

      const devResponse = await request(app).get('/test/unhandled-error').expect(500);

      expect(devResponse.body.error).toBeDefined();
      expect(devResponse.body.error.message).toBe('Something went wrong unexpectedly');

      // Then test in production mode (hides actual error message)
      process.env.NODE_ENV = 'production';

      const prodResponse = await request(app).get('/test/unhandled-error').expect(500);

      expect(prodResponse.body.error).toBeDefined();
      expect(prodResponse.body.error.message).toBe('Internal server error');

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});

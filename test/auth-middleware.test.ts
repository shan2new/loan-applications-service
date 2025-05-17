import request from 'supertest';
import { Express } from 'express';
import { setupTestApp, TestDatabase, TEST_API_TOKEN } from './test-utils';

describe('Authentication Middleware', () => {
  let app: Express;
  const testDb = TestDatabase.getInstance();

  // Set up the test database and app once before all tests
  beforeAll(async () => {
    await testDb.setup();
    app = await setupTestApp();
  });

  // Clean up after all tests are complete
  afterAll(async () => {
    await testDb.teardown();
  });

  describe('Global Authentication', () => {
    it('should allow access to the health endpoint without authentication', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should deny access to API endpoints without authentication token', async () => {
      const response = await request(app).get('/api/customers').expect(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Authentication token is required');
    });

    it('should deny access with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('x-access-token', 'invalid-token')
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Invalid authentication token');
    });

    it('should allow access with valid authentication token', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('x-access-token', TEST_API_TOKEN)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

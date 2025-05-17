import request from 'supertest';
import { Express } from 'express';
import { setupTestApp, TestDatabase, authenticatedRequest } from './test-utils';

// Check if we're running in CI environment
const isCI = process.env.CI === 'true' || process.env.CODEBUILD_BUILD_ID !== undefined;

// Define a conditional test function that skips tests in CI
const conditionalTest = isCI ? test.skip : test;

// Define interfaces for the API responses
interface CustomerDto {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

describe('Customer API', () => {
  let app: Express;
  const testDb = TestDatabase.getInstance();

  // Set up the test database and app once before all tests
  beforeAll(async () => {
    await testDb.setup();
    app = await setupTestApp();
  });

  beforeEach(async () => {
    await testDb.resetDatabase();
  });

  // Clean up after all tests are complete
  afterAll(async () => {
    await testDb.teardown();
  });

  describe('POST /api/customers', () => {
    conditionalTest('should create a new customer', async () => {
      const customer = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      };

      const response = await authenticatedRequest(app)
        .post('/api/customers')
        .send(customer)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.fullName).toBe(customer.fullName);
      expect(response.body.data.email).toBe(customer.email);
      expect(response.body.data).toHaveProperty('createdAt');
    });

    conditionalTest('should return 400 if email is invalid', async () => {
      const customer = {
        fullName: 'John Doe',
        email: 'invalid-email',
      };

      const response = await authenticatedRequest(app)
        .post('/api/customers')
        .send(customer)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBeDefined();
    });

    conditionalTest('should return 400 if name is too short', async () => {
      const customer = {
        fullName: 'J',
        email: 'john.doe@example.com',
      };

      const response = await authenticatedRequest(app)
        .post('/api/customers')
        .send(customer)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBeDefined();
    });

    conditionalTest('should return 401 if authorization token is missing', async () => {
      const customer = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      };

      const response = await request(app).post('/api/customers').send(customer).expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Authentication token is required');
    });
  });

  describe('GET /api/customers', () => {
    conditionalTest('should return an empty array when no customers exist', async () => {
      const response = await authenticatedRequest(app).get('/api/customers').expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    conditionalTest('should return all customers', async () => {
      // Create test customers
      const customers = [
        {
          fullName: 'John Doe',
          email: `john.doe.${Date.now()}@example.com`,
        },
        {
          fullName: 'Jane Smith',
          email: `jane.smith.${Date.now()}@example.com`,
        },
      ];

      // Create the customers
      const createdCustomers = [];
      for (const customer of customers) {
        const response = await authenticatedRequest(app)
          .post('/api/customers')
          .send(customer)
          .expect(201);
        createdCustomers.push(response.body.data);
      }

      // Get all customers
      const response = await authenticatedRequest(app).get('/api/customers').expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      // Check if the response contains the customers we created
      const emails = response.body.data.map((c: CustomerDto) => c.email);
      expect(emails).toContain(createdCustomers[0].email);
      expect(emails).toContain(createdCustomers[1].email);
    });

    conditionalTest('should support pagination', async () => {
      // Create multiple test customers
      const customers = Array.from({ length: 5 }).map((_, i) => ({
        fullName: `Customer ${i}`,
        email: `customer.${i}.${Date.now()}@example.com`,
      }));

      // Create the customers
      const createdCustomers = [];
      for (const customer of customers) {
        const response = await authenticatedRequest(app)
          .post('/api/customers')
          .send(customer)
          .expect(201);
        createdCustomers.push(response.body.data);
      }

      // Test first page (2 items)
      const firstPage = await authenticatedRequest(app)
        .get('/api/customers?page=1&pageSize=2')
        .expect(200);

      expect(firstPage.body.data).toBeInstanceOf(Array);
      expect(firstPage.body.data.length).toBe(2);
      expect(firstPage.body.pagination.total).toBeGreaterThanOrEqual(createdCustomers.length);
      expect(firstPage.body.pagination.totalPages).toBeGreaterThanOrEqual(
        Math.ceil(createdCustomers.length / 2),
      );

      // Test second page
      const secondPage = await authenticatedRequest(app)
        .get('/api/customers?page=2&pageSize=2')
        .expect(200);

      expect(secondPage.body.data).toBeInstanceOf(Array);
      expect(secondPage.body.data.length).toBe(2);
      expect(secondPage.body.pagination.page).toBe(2);

      // Make sure we got different records
      const firstPageIds = firstPage.body.data.map((c: CustomerDto) => c.id);
      const secondPageIds = secondPage.body.data.map((c: CustomerDto) => c.id);

      // No overlap between pages
      expect(firstPageIds.some((id: number) => secondPageIds.includes(id))).toBe(false);
    });
  });

  describe('GET /api/customers/:id', () => {
    conditionalTest('should return a customer by ID', async () => {
      // Create a test customer
      const customer = {
        fullName: 'John Doe',
        email: `john.doe.${Date.now()}@example.com`,
      };

      const createResponse = await authenticatedRequest(app).post('/api/customers').send(customer);

      expect(createResponse.statusCode).toBe(201);

      const customerId = createResponse.body.data.id;

      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await authenticatedRequest(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', customerId);
      expect(response.body.data.fullName).toBe(customer.fullName);
      expect(response.body.data.email).toBe(customer.email);
    });

    conditionalTest('should return 404 if customer does not exist', async () => {
      const response = await authenticatedRequest(app).get('/api/customers/999').expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('not found');
    });

    conditionalTest('should return 400 if ID is invalid', async () => {
      const response = await authenticatedRequest(app).get('/api/customers/invalid-id').expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/customers/:id', () => {
    conditionalTest('should update a customer', async () => {
      // Create a test customer
      const customer = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      };

      const createResponse = await authenticatedRequest(app).post('/api/customers').send(customer);

      const customerId = createResponse.body.data.id;

      // Update the customer
      const update = {
        fullName: 'John Updated',
      };

      const response = await authenticatedRequest(app)
        .patch(`/api/customers/${customerId}`)
        .send(update)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', customerId);
      expect(response.body.data.fullName).toBe(update.fullName);
      expect(response.body.data.email).toBe(customer.email); // Email unchanged
    });

    conditionalTest('should return 404 if customer does not exist', async () => {
      const update = {
        fullName: 'John Updated',
      };

      const response = await authenticatedRequest(app)
        .patch('/api/customers/999')
        .send(update)
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('not found');
    });

    conditionalTest('should return 400 if update data is invalid', async () => {
      // Create a test customer
      const customer = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      };

      const createResponse = await authenticatedRequest(app).post('/api/customers').send(customer);

      const customerId = createResponse.body.data.id;

      // Invalid update (empty object)
      const response = await authenticatedRequest(app)
        .patch(`/api/customers/${customerId}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/customers/:id', () => {
    conditionalTest('should delete a customer', async () => {
      // Create a test customer
      const customer = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      };

      const createResponse = await authenticatedRequest(app).post('/api/customers').send(customer);

      const customerId = createResponse.body.data.id;

      // Delete the customer
      await authenticatedRequest(app).delete(`/api/customers/${customerId}`).expect(204);

      // Verify customer is deleted
      await authenticatedRequest(app).get(`/api/customers/${customerId}`).expect(404);
    });

    conditionalTest('should return 404 if customer does not exist', async () => {
      const response = await authenticatedRequest(app).delete('/api/customers/999').expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('not found');
    });
  });
});

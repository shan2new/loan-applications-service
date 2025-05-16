// This file will be run after the test environment is set up but before tests are run

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.API_ACCESS_TOKEN = 'test-api-token';
process.env.PORT = '3001'; // Use a different port for tests

// Increase test timeout
jest.setTimeout(15000); // 15 second timeout for longer running tests

// Suppress console logs during tests
global.console = {
  ...console,
  // Uncomment these lines to silence specific console methods during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

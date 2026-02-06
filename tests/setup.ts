/**
 * Jest Test Setup
 * Provides global test configuration and utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/callback';
process.env.GCALENDAR_DEFAULT_CALENDAR = 'primary';

// Increase timeout for async tests
jest.setTimeout(30000);

// Export test utilities
export const testUtils = {
  /**
   * Create a delay for async testing
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate a unique test ID
   */
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
};

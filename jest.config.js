/**
 * Jest configuration for Google Calendar Skill
 * Provides comprehensive testing setup with coverage reporting
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directory
  rootDir: '.',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
  ],

  // Test suite ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/cli/**',
  ],

  // Coverage directories
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/client/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/utils/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/commands/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Module name mappings for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Detect open handles
  detectOpenHandles: true,

  // Force exit after tests
  forceExit: true,
};

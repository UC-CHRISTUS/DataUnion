// Jest setup file for global test configuration

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Suppress console.error in tests to avoid noise from expected error test cases
// We can still use console.error in tests explicitly if needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Only suppress "API Error:" messages which are expected in error handling tests
    if (typeof args[0] === 'string' && args[0].includes('API Error:')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Extend Jest matchers if needed
// import '@testing-library/jest-dom';

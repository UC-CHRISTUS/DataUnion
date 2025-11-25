// Jest setup file for global test configuration

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Suppress console.error and console.warn in tests to avoid noise from expected error test cases
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress common expected errors in tests
    const message = typeof args[0] === 'string' ? args[0] : '';
    const suppressPatterns = [
      'API Error:',
      'Error de autenticación:',
      'Error al obtener datos del usuario:',
      'Error en signin:',
      'Error al verificar sesión:',
      'Error in GET',
      'Error in POST',
      'Error verifying user',
      'Error creating user',
      'Error updating password:',
      'Error updating user must_change_password flag:',
      'Error al cerrar sesión:',
      'Error en signout:',
    ];

    if (suppressPatterns.some(pattern => message.includes(pattern))) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // Suppress expected warnings in tests
    const message = typeof args[0] === 'string' ? args[0] : '';
    const suppressPatterns = [
      'User created in auth.users but not in public.users:',
      'Password changed successfully but must_change_password flag not updated',
    ];

    if (suppressPatterns.some(pattern => message.includes(pattern))) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Extend Jest matchers if needed
// import '@testing-library/jest-dom';

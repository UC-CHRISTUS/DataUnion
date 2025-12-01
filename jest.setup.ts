// Jest setup file for global test configuration

// Polyfill File for Node.js test environment (File is a Web API not available in Node.js global scope)
if (typeof globalThis.File === 'undefined') {
  // Simple File polyfill extending Blob
  class FilePolyfill extends Blob {
    name: string;
    lastModified: number;
    
    constructor(chunks: BlobPart[], filename: string, options?: FilePropertyBag) {
      super(chunks, options);
      this.name = filename;
      this.lastModified = options?.lastModified ?? Date.now();
    }
  }
  globalThis.File = FilePolyfill as unknown as typeof File;
}

// Suppress Node.js warnings (e.g., --localstorage-file warning from Supabase)
const originalEmit = process.emit;
// @ts-expect-error - Overriding process.emit for warning suppression
process.emit = function (event: string, ...args: unknown[]) {
  if (event === 'warning' && args[0] && typeof args[0] === 'object' && 'name' in args[0]) {
    const warning = args[0] as { name: string; message?: string };
    if (warning.message?.includes('localstorage-file')) {
      return false;
    }
  }
  return originalEmit.apply(process, [event, ...args] as Parameters<typeof originalEmit>);
};

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Suppress console.error and console.warn in tests to avoid noise from expected error test cases
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
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
      'Error fetching sigesa',
      'Error al cargar filas SIGESA',
      'not wrapped in act',
      'Failed to load norma',
      'Error in rejection:'
    ];

    if (suppressPatterns.some(pattern => message.includes(pattern))) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
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

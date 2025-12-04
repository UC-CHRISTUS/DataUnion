/**
 * Setup para tests de seguridad
 * Configuración global para tests críticos
 */

import { config } from 'dotenv';

// Cargar variables de entorno de testing
config({ path: '.env.local' });

export const TEST_CONFIG = {
  // URLs de testing
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Credenciales de prueba
  TEST_USERS: {
    encoder: {
      email: 'codificador@dataunion.cl',
      password: 'Admin123!',
      role: 'encoder'
    },
    finance: {
      email: 'finanzas@dataunion.cl',
      password: 'Admin123!',
      role: 'finance'
    },
    admin: {
      email: 'admin@dataunion.cl',
      password: 'Admin123!',
      role: 'admin'
    }
  },
  
  // Timeouts
  TIMEOUT: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000
  },
  
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export interface TestResult {
  testId: string;
  name: string;
  severity: 'CRITICAL' | 'IMPORTANT' | 'IMPROVEMENT';
  status: 'PASSED' | 'FAILED' | 'ERROR';
  message: string;
  details?: any;
  timestamp: string;
}

export class SecurityTestRunner {
  private results: TestResult[] = [];

  constructor(private category: string) {}

  async runTest(
    testId: string,
    name: string,
    severity: TestResult['severity'],
    testFn: () => Promise<void>
  ): Promise<TestResult> {
    const result: TestResult = {
      testId,
      name,
      severity,
      status: 'PASSED',
      message: 'Test passed successfully',
      timestamp: new Date().toISOString()
    };

    try {
      await testFn();
    } catch (error: any) {
      result.status = 'FAILED';
      result.message = error.message || 'Test failed';
      result.details = error;
    }

    this.results.push(result);
    return result;
  }

  getResults(): TestResult[] {
    return this.results;
  }

  printSummary(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 ${this.category} - Test Summary`);
    console.log('='.repeat(60));
    console.log(`Total: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);
    console.log('='.repeat(60) + '\n');
  }
}

// Helper para hacer peticiones HTTP sin autenticación
export async function makeUnauthenticatedRequest(
  method: string,
  path: string,
  body?: any
): Promise<Response> {
  const url = `${TEST_CONFIG.API_URL}${path}`;
  
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Helper para hacer peticiones autenticadas
export async function makeAuthenticatedRequest(
  method: string,
  path: string,
  token: string,
  body?: any
): Promise<Response> {
  const url = `${TEST_CONFIG.API_URL}${path}`;
  
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Helper para login con Supabase y obtener token de sesión
export async function loginAndGetToken(email: string, password: string): Promise<string> {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    TEST_CONFIG.SUPABASE_URL!,
    TEST_CONFIG.SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(`Login failed: ${error?.message || 'No session returned'}`);
  }

  return data.session.access_token;
}

/**
 * CRITICAL SECURITY TESTS - AUTHENTICATION
 * Tests AUTH-001 to AUTH-005
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, makeUnauthenticatedRequest, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - Authentication Security Tests', () => {
  const runner = new SecurityTestRunner('Authentication');

  afterAll(() => {
    runner.printSummary();
  });

  /**
   * TEST-AUTH-001: Acceso sin login
   * Severidad: CRÍTICO
   * Descripción: Intentar acceder directamente a rutas protegidas sin autenticación
   */
  test('AUTH-001: Access protected routes without login', async () => {
    await runner.runTest(
      'TEST-AUTH-001',
      'Access protected routes without login',
      'CRITICAL',
      async () => {
        const protectedRoutes = [
          '/api/v1/grd/active-workflow',
          '/api/v1/grd/1',
          '/api/v1/admin/approved-files',
        ];

        for (const route of protectedRoutes) {
          const response = await makeUnauthenticatedRequest('GET', route);
          
          // Debe retornar 401 Unauthorized o 403 Forbidden
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(
              `❌ SECURITY BREACH: Route ${route} returned ${response.status} instead of 401/403`
            );
          }
        }

        console.log('✅ AUTH-001: All protected routes properly secured');
      }
    );
  });

  /**
   * TEST-AUTH-002: Token expirado
   * Severidad: CRÍTICO
   * Descripción: Usar token expirado o inválido
   */
  test('AUTH-002: Expired or invalid token', async () => {
    await runner.runTest(
      'TEST-AUTH-002',
      'Expired or invalid token',
      'CRITICAL',
      async () => {
        const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INVALID';
        
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/active-workflow`, {
          headers: {
            'Authorization': `Bearer ${invalidToken}`,
          },
        });

        if (response.status !== 401 && response.status !== 403) {
          throw new Error(
            `❌ SECURITY BREACH: Invalid token accepted. Status: ${response.status}`
          );
        }

        console.log('✅ AUTH-002: Invalid tokens properly rejected');
      }
    );
  });

  /**
   * TEST-AUTH-004: Manipulación de localStorage
   * Severidad: CRÍTICO
   * Descripción: Sistema debe validar en backend, no confiar en localStorage
   */
  test('AUTH-004: Backend validates role, not localStorage', async () => {
    await runner.runTest(
      'TEST-AUTH-004',
      'Backend validates role independently',
      'CRITICAL',
      async () => {
        // Login como encoder
        const token = await loginAndGetToken(
          TEST_CONFIG.TEST_USERS.encoder.email,
          TEST_CONFIG.TEST_USERS.encoder.password
        );

        // Intentar acceder a ruta de admin con token de encoder
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/admin/approved-files`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          throw new Error(
            `❌ SECURITY BREACH: Encoder accessed admin route with valid token`
          );
        }

        console.log('✅ AUTH-004: Backend properly validates roles');
      }
    );
  });

  /**
   * TEST-AUTH-005: SQL Injection en login
   * Severidad: CRÍTICO
   * Descripción: Intentar inyectar SQL en formulario de login
   */
  test('AUTH-005: SQL Injection in login form', async () => {
    await runner.runTest(
      'TEST-AUTH-005',
      'SQL Injection in login',
      'CRITICAL',
      async () => {
        const sqlInjectionPayloads = [
          "' OR '1'='1' --",
          "admin'--",
          "' OR 1=1--",
          "'; DROP TABLE users; --",
        ];

        for (const payload of sqlInjectionPayloads) {
          const response = await makeUnauthenticatedRequest('POST', '/api/auth/login', {
            email: payload,
            password: payload,
          });

          // No debe permitir login con SQL injection
          if (response.ok) {
            throw new Error(
              `❌ SECURITY BREACH: SQL Injection payload accepted: ${payload}`
            );
          }
        }

        console.log('✅ AUTH-005: SQL Injection properly prevented');
      }
    );
  });
});

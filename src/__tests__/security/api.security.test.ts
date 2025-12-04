/**
 * CRITICAL SECURITY TESTS - API DIRECT ACCESS
 * Tests API-001 to API-005
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, makeUnauthenticatedRequest, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - API Security Tests', () => {
  const runner = new SecurityTestRunner('API Direct Access');
  let encoderToken: string;

  beforeAll(async () => {
    encoderToken = await loginAndGetToken(
      TEST_CONFIG.TEST_USERS.encoder.email,
      TEST_CONFIG.TEST_USERS.encoder.password
    );
  });

  afterAll(() => {
    runner.printSummary();
  });

  /**
   * TEST-API-001: GET active-workflow sin token
   * Severidad: CRÍTICO
   */
  test('API-001: Endpoints reject unauthenticated requests', async () => {
    await runner.runTest(
      'TEST-API-001',
      'APIs require authentication',
      'CRITICAL',
      async () => {
        const endpoints = [
          '/api/v1/grd/active-workflow',
          '/api/v1/grd/1',
          '/api/v1/grd/rows/12345',
        ];

        for (const endpoint of endpoints) {
          const response = await makeUnauthenticatedRequest('GET', endpoint);
          
          if (response.status !== 401 && response.status !== 403) {
            throw new Error(
              `❌ SECURITY BREACH: ${endpoint} accessible without authentication (${response.status})`
            );
          }
        }

        console.log('✅ API-001: All endpoints properly require authentication');
      }
    );
  });

  /**
   * TEST-API-002: POST submit-encoder sin token
   * Severidad: CRÍTICO
   */
  test('API-002: POST endpoints require authentication', async () => {
    await runner.runTest(
      'TEST-API-002',
      'POST endpoints require authentication',
      'CRITICAL',
      async () => {
        const response = await makeUnauthenticatedRequest(
          'POST',
          '/api/v1/grd/1/submit-encoder'
        );

        if (response.status !== 401 && response.status !== 403) {
          throw new Error(
            `❌ SECURITY BREACH: Submit endpoint accessible without auth (${response.status})`
          );
        }

        console.log('✅ API-002: POST endpoints properly secured');
      }
    );
  });

  /**
   * TEST-API-003: GET datos sensibles sin autenticación
   * Severidad: CRÍTICO
   */
  test('API-003: Sensitive data requires authentication', async () => {
    await runner.runTest(
      'TEST-API-003',
      'Patient data requires authentication',
      'CRITICAL',
      async () => {
        const sensitiveEndpoints = [
          '/api/v1/grd/rows/12345',
          '/api/v1/sigesa/1',
          '/api/v1/admin/users',
        ];

        for (const endpoint of sensitiveEndpoints) {
          const response = await makeUnauthenticatedRequest('GET', endpoint);
          
          if (response.ok) {
            throw new Error(
              `❌ DATA BREACH: Sensitive data accessible at ${endpoint} without auth`
            );
          }
        }

        console.log('✅ API-003: Sensitive data properly protected');
      }
    );
  });

  /**
   * TEST-API-004: Encoder llama API de admin
   * Severidad: CRÍTICO
   */
  test('API-004: Role-based API access control', async () => {
    await runner.runTest(
      'TEST-API-004',
      'APIs enforce role-based access',
      'CRITICAL',
      async () => {
        const adminOnlyEndpoints = [
          '/api/v1/admin/approved-files',
          '/api/v1/admin/users',
        ];

        for (const endpoint of adminOnlyEndpoints) {
          const response = await fetch(`${TEST_CONFIG.API_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${encoderToken}`,
            },
          });

          if (response.ok) {
            throw new Error(
              `❌ PRIVILEGE ESCALATION: Encoder accessed admin endpoint ${endpoint}`
            );
          }
        }

        console.log('✅ API-004: Role-based access properly enforced');
      }
    );
  });

  /**
   * TEST-API-005: SQL Injection en query params
   * Severidad: CRÍTICO
   */
  test('API-005: SQL Injection in query parameters', async () => {
    await runner.runTest(
      'TEST-API-005',
      'Query parameters protected from SQL injection',
      'CRITICAL',
      async () => {
        const sqlPayloads = [
          "' OR '1'='1",
          "1' UNION SELECT * FROM users--",
          "'; DROP TABLE grd_fila; --",
        ];

        for (const payload of sqlPayloads) {
          const encodedPayload = encodeURIComponent(payload);
          const response = await fetch(
            `${TEST_CONFIG.API_URL}/api/v1/grd/rows?episodio=${encodedPayload}`,
            {
              headers: {
                'Authorization': `Bearer ${encoderToken}`,
              },
            }
          );

          // API debe validar o rechazar, no ejecutar SQL injection
          if (response.ok) {
            const data = await response.json();
            
            // No debería retornar datos de otras tablas o errores SQL
            if (JSON.stringify(data).includes('users') || 
                JSON.stringify(data).includes('syntax error')) {
              throw new Error(
                `❌ SQL INJECTION: Query parameter vulnerable to SQL injection`
              );
            }
          }
        }

        console.log('✅ API-005: Query parameters properly sanitized');
      }
    );
  });
});

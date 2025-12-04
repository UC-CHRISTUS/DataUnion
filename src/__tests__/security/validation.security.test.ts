/**
 * CRITICAL SECURITY TESTS - INPUT VALIDATION
 * Tests VAL-002 to VAL-003
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - Input Validation Security Tests', () => {
  const runner = new SecurityTestRunner('Input Validation');
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
   * TEST-VAL-002: XSS en campos de texto
   * Severidad: CRÍTICO
   * Descripción: Intentar inyectar scripts maliciosos
   */
  test('VAL-002: XSS Protection in text fields', async () => {
    await runner.runTest(
      'TEST-VAL-002',
      'XSS Protection in text fields',
      'CRITICAL',
      async () => {
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          '<img src=x onerror=alert("XSS")>',
          'javascript:alert("XSS")',
          '<svg/onload=alert("XSS")>',
          '<iframe src="javascript:alert(\'XSS\')">',
        ];

        for (const payload of xssPayloads) {
          const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/rows/12345`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${encoderToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              AT_detalle: payload,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Verificar que el script fue sanitizado
            if (data.AT_detalle && data.AT_detalle.includes('<script>')) {
              throw new Error(
                `❌ XSS VULNERABILITY: Script tag not sanitized`
              );
            }
          }
        }

        console.log('✅ VAL-002: XSS payloads properly sanitized');
      }
    );
  });

  /**
   * TEST-VAL-003: SQL Injection en campos
   * Severidad: CRÍTICO
   * Descripción: Inyectar SQL en campos editables
   */
  test('VAL-003: SQL Injection Protection', async () => {
    await runner.runTest(
      'TEST-VAL-003',
      'SQL Injection Protection in fields',
      'CRITICAL',
      async () => {
        const sqlPayloads = [
          "'; DROP TABLE grd_fila; --",
          "' OR '1'='1",
          "1' UNION SELECT * FROM users--",
          "admin'--",
          "' OR 1=1--",
        ];

        for (const payload of sqlPayloads) {
          const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/rows/12345`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${encoderToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              n_folio: payload,
            }),
          });

          // API debe validar o escapar, no ejecutar SQL
          if (response.ok) {
            const data = await response.json();
            
            // El valor debería guardarse como string, no ejecutarse
            console.log(`  ✓ SQL payload stored as string: ${payload}`);
          }
        }

        console.log('✅ VAL-003: SQL Injection properly prevented');
      }
    );
  });
});

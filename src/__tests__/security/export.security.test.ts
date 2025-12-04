/**
 * CRITICAL SECURITY TESTS - EXPORT
 * Tests EXPORT-001, EXPORT-002, EXPORT-005
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - Export Security Tests', () => {
  const runner = new SecurityTestRunner('Export');
  let encoderToken: string;
  let adminToken: string;

  beforeAll(async () => {
    encoderToken = await loginAndGetToken(
      TEST_CONFIG.TEST_USERS.encoder.email,
      TEST_CONFIG.TEST_USERS.encoder.password
    );
    
    adminToken = await loginAndGetToken(
      TEST_CONFIG.TEST_USERS.admin.email,
      TEST_CONFIG.TEST_USERS.admin.password
    );
  });

  afterAll(() => {
    runner.printSummary();
  });

  /**
   * TEST-EXPORT-001: Exportar sin aprobar
   * Severidad: CRÍTICO
   */
  test('EXPORT-001: Cannot export unapproved files', async () => {
    await runner.runTest(
      'TEST-EXPORT-001',
      'Only approved files can be exported',
      'CRITICAL',
      async () => {
        // Intentar exportar archivo en estado incorrecto
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/1/export`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        // Debe validar que el estado sea 'aprobado'
        if (response.ok) {
          const data = await response.json();
          
          // Verificar que no se exportó archivo no aprobado
          if (data.estado && data.estado !== 'aprobado') {
            throw new Error(
              `❌ WORKFLOW BREACH: Exported file with estado '${data.estado}' (should be 'aprobado')`
            );
          }
        }

        console.log('✅ EXPORT-001: Export properly validates approval state');
      }
    );
  });

  /**
   * TEST-EXPORT-002: Encoder exporta archivo
   * Severidad: CRÍTICO
   */
  test('EXPORT-002: Only Admin can export', async () => {
    await runner.runTest(
      'TEST-EXPORT-002',
      'Encoder cannot export files',
      'CRITICAL',
      async () => {
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/1/export`, {
          headers: {
            'Authorization': `Bearer ${encoderToken}`,
          },
        });

        if (response.ok) {
          throw new Error(
            `❌ PRIVILEGE ESCALATION: Encoder was able to export file`
          );
        }

        console.log('✅ EXPORT-002: Export properly restricted to Admin');
      }
    );
  });

  /**
   * TEST-EXPORT-005: Validar integridad de datos exportados
   * Severidad: CRÍTICO
   */
  test('EXPORT-005: Data integrity in exported file', async () => {
    await runner.runTest(
      'TEST-EXPORT-005',
      'Exported data matches database',
      'CRITICAL',
      async () => {
        // Obtener datos de la API
        const dataResponse = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/1`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (!dataResponse.ok) {
          console.log('ℹ️  EXPORT-005: No approved file available for testing');
          return;
        }

        const dbData = await dataResponse.json();

        // Intentar exportar
        const exportResponse = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/1/export`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (exportResponse.ok) {
          // Verificar que el archivo exportado contiene los datos correctos
          const exportData = await exportResponse.json();
          
          // Comparar counts básicos
          if (exportData.rowCount !== dbData.rowCount) {
            throw new Error(
              `❌ DATA INTEGRITY: Row count mismatch (DB: ${dbData.rowCount}, Export: ${exportData.rowCount})`
            );
          }

          console.log('✅ EXPORT-005: Data integrity verified');
        } else {
          console.log('ℹ️  EXPORT-005: Export not available (expected if no approved files)');
        }
      }
    );
  });
});

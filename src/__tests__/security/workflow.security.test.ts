/**
 * CRITICAL SECURITY TESTS - WORKFLOW & STATE MANIPULATION
 * Tests WF-001, WF-005, WF-008
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - Workflow Security Tests', () => {
  const runner = new SecurityTestRunner('Workflow & State');
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
   * TEST-WF-001: Cambiar estado manualmente vía API
   * Severidad: CRÍTICO
   * Descripción: Intentar saltar estados del workflow
   */
  test('WF-001: Cannot manually change workflow state', async () => {
    await runner.runTest(
      'TEST-WF-001',
      'Cannot bypass workflow states',
      'CRITICAL',
      async () => {
        // Intentar cambiar estado directamente a 'aprobado' sin pasar por el flujo
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/1`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${encoderToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'aprobado' }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.estado === 'aprobado') {
            throw new Error(
              `❌ WORKFLOW BREACH: User bypassed workflow and changed state to 'aprobado'`
            );
          }
        }

        console.log('✅ WF-001: Workflow states properly protected');
      }
    );
  });

  /**
   * TEST-WF-005: Múltiples archivos en flujo simultáneamente
   * Severidad: CRÍTICO
   * Descripción: Sistema debe permitir solo UN archivo en proceso
   */
  test('WF-005: Only one file allowed in workflow', async () => {
    await runner.runTest(
      'TEST-WF-005',
      'Single file workflow enforcement',
      'CRITICAL',
      async () => {
        // Verificar si hay archivo activo
        const activeResponse = await fetch(
          `${TEST_CONFIG.API_URL}/api/v1/grd/active-workflow`,
          {
            headers: {
              'Authorization': `Bearer ${encoderToken}`,
            },
          }
        );

        const activeData = await activeResponse.json();

        if (activeData.hasActiveFile) {
          // Si hay archivo activo, intentar subir otro debería fallar
          const formData = new FormData();
          const fakeFile = new Blob(['fake data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          formData.append('file', fakeFile, 'test.xlsx');

          const uploadResponse = await fetch(
            `${TEST_CONFIG.API_URL}/api/v1/sigesa/upload`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${encoderToken}`,
              },
              body: formData,
            }
          );

          if (uploadResponse.ok) {
            throw new Error(
              `❌ WORKFLOW BREACH: System allowed multiple files in workflow simultaneously`
            );
          }

          console.log('✅ WF-005: Single file workflow properly enforced');
        } else {
          console.log('ℹ️  WF-005: No active file to test against');
        }
      }
    );
  });

  /**
   * TEST-WF-008: Editar archivo exportado
   * Severidad: CRÍTICO
   * Descripción: Archivos exportados deben ser inmutables
   */
  test('WF-008: Cannot edit exported files', async () => {
    await runner.runTest(
      'TEST-WF-008',
      'Exported files are immutable',
      'CRITICAL',
      async () => {
        // Intentar editar un archivo en estado 'exportado'
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/rows/12345`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            AT: 'INTENTO_EDICION',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Verificar que no se permitió la edición
          if (data.AT === 'INTENTO_EDICION') {
            throw new Error(
              `❌ DATA INTEGRITY BREACH: Exported file was modified`
            );
          }
        }

        console.log('✅ WF-008: Exported files properly protected');
      }
    );
  });
});

/**
 * CRITICAL SECURITY TESTS - FILE UPLOAD
 * Tests UPLOAD-001, UPLOAD-008, UPLOAD-009
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - File Upload Security Tests', () => {
  const runner = new SecurityTestRunner('File Upload');
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
   * TEST-UPLOAD-001: Archivo ejecutable (.exe)
   * Severidad: CRÍTICO
   */
  test('UPLOAD-001: Reject executable files', async () => {
    await runner.runTest(
      'TEST-UPLOAD-001',
      'System rejects executable files',
      'CRITICAL',
      async () => {
        const formData = new FormData();
        
        // Simular archivo .exe renombrado como .xlsx
        const maliciousFile = new Blob(['MZ\x90\x00'], { 
          type: 'application/x-msdownload' 
        });
        
        formData.append('file', maliciousFile, 'virus.xlsx');

        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/sigesa/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${encoderToken}`,
          },
          body: formData,
        });

        if (response.ok) {
          throw new Error(
            `❌ SECURITY BREACH: System accepted executable file`
          );
        }

        console.log('✅ UPLOAD-001: Executable files properly rejected');
      }
    );
  });

  /**
   * TEST-UPLOAD-008: Path traversal en nombre
   * Severidad: CRÍTICO
   */
  test('UPLOAD-008: Path traversal protection', async () => {
    await runner.runTest(
      'TEST-UPLOAD-008',
      'Filename path traversal protection',
      'CRITICAL',
      async () => {
        const maliciousFilenames = [
          '../../etc/passwd.xlsx',
          '../../../root/.ssh/id_rsa.xlsx',
          '..\\..\\windows\\system32\\config\\sam.xlsx',
        ];

        for (const filename of maliciousFilenames) {
          const formData = new FormData();
          const fakeFile = new Blob(['fake'], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          
          formData.append('file', fakeFile, filename);

          const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/sigesa/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${encoderToken}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            
            // Verificar que el filename fue sanitizado
            if (data.filename && (data.filename.includes('..') || data.filename.includes('\\'))) {
              throw new Error(
                `❌ PATH TRAVERSAL: Filename not sanitized: ${data.filename}`
              );
            }
          }
        }

        console.log('✅ UPLOAD-008: Path traversal properly prevented');
      }
    );
  });

  /**
   * TEST-UPLOAD-009: Subir 10 archivos simultáneamente
   * Severidad: CRÍTICO
   * Descripción: Race condition - solo 1 debería aceptarse
   */
  test('UPLOAD-009: Race condition protection', async () => {
    await runner.runTest(
      'TEST-UPLOAD-009',
      'Race condition on file upload',
      'CRITICAL',
      async () => {
        const uploadPromises = [];

        // Intentar subir 10 archivos al mismo tiempo
        for (let i = 0; i < 10; i++) {
          const formData = new FormData();
          const fakeFile = new Blob(['fake data'], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          
          formData.append('file', fakeFile, `test-${i}.xlsx`);

          const promise = fetch(`${TEST_CONFIG.API_URL}/api/v1/sigesa/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${encoderToken}`,
            },
            body: formData,
          });

          uploadPromises.push(promise);
        }

        const responses = await Promise.all(uploadPromises);
        const successCount = responses.filter(r => r.ok).length;

        // Solo 1 debería tener éxito (o 0 si ya hay archivo activo)
        if (successCount > 1) {
          throw new Error(
            `❌ RACE CONDITION: ${successCount} files uploaded simultaneously (should be max 1)`
          );
        }

        console.log(`✅ UPLOAD-009: Race condition handled (${successCount} accepted)`);
      }
    );
  });
});

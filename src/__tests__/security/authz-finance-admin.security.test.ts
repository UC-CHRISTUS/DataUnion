/**
 * CRITICAL SECURITY TESTS - AUTHORIZATION (Finance & Admin)
 * Tests AUTHZ-005 to AUTHZ-007
 */

import { describe, test, expect } from '@jest/globals';
import { SecurityTestRunner, TEST_CONFIG, loginAndGetToken } from './setup';

describe('🔴 CRITICAL - Authorization Security Tests (Finance & Admin)', () => {
  const runner = new SecurityTestRunner('Authorization - Finance & Admin');
  let financeToken: string;
  let adminToken: string;

  beforeAll(async () => {
    financeToken = await loginAndGetToken(
      TEST_CONFIG.TEST_USERS.finance.email,
      TEST_CONFIG.TEST_USERS.finance.password
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
   * TEST-AUTHZ-005: Finance edita campos de Encoder
   * Severidad: CRÍTICO
   * Descripción: Finance NO debe poder editar AT, AT_detalle
   */
  test('AUTHZ-005: Finance cannot edit Encoder fields', async () => {
    await runner.runTest(
      'TEST-AUTHZ-005',
      'Finance cannot edit Encoder fields',
      'CRITICAL',
      async () => {
        const encoderFields = {
          AT: 'NUEVO_AT',
          AT_detalle: 'Campo bloqueado',
        };

        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/rows/12345`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${financeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(encoderFields),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.AT !== undefined) {
            throw new Error(
              `❌ DATA BREACH: Finance was able to modify Encoder fields`
            );
          }
        }

        console.log('✅ AUTHZ-005: Encoder fields protected from Finance');
      }
    );
  });

  /**
   * TEST-AUTHZ-006: Finance aprueba archivo
   * Severidad: CRÍTICO
   * Descripción: Finance NO puede aprobar (solo Admin)
   */
  test('AUTHZ-006: Finance cannot approve files', async () => {
    await runner.runTest(
      'TEST-AUTHZ-006',
      'Finance cannot approve files',
      'CRITICAL',
      async () => {
        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/1/review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${financeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'aprobar' }),
        });

        if (response.ok) {
          throw new Error(
            `❌ PRIVILEGE ESCALATION: Finance was able to approve file`
          );
        }

        console.log('✅ AUTHZ-006: Finance properly blocked from approving');
      }
    );
  });

  /**
   * TEST-AUTHZ-007: Admin edita datos (debería ser read-only)
   * Severidad: CRÍTICO
   * Descripción: Admin NO debe poder editar ningún dato
   */
  test('AUTHZ-007: Admin cannot edit data (read-only)', async () => {
    await runner.runTest(
      'TEST-AUTHZ-007',
      'Admin is read-only, cannot edit data',
      'CRITICAL',
      async () => {
        const anyFields = {
          AT: 'HACK',
          validado: false,
          n_folio: '99999',
        };

        const response = await fetch(`${TEST_CONFIG.API_URL}/api/v1/grd/rows/12345`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(anyFields),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Admin no debería poder editar nada
          if (Object.keys(anyFields).some(key => data[key] !== undefined)) {
            throw new Error(
              `❌ DATA BREACH: Admin was able to modify data (should be read-only)`
            );
          }
        }

        console.log('✅ AUTHZ-007: Admin properly restricted to read-only');
      }
    );
  });
});

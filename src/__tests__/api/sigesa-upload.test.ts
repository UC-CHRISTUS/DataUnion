/**
 * Integration Tests: POST /api/v1/sigesa/upload
 * 
 * Tests SIGESA Excel file upload and processing.
 * Creates minimal Excel files in memory for testing.
 */

import { POST } from '@/app/api/v1/sigesa/upload/route';
import { NextRequest } from 'next/server';
import ExcelJS from 'exceljs';

// Mock data storage
let mockDatabase: Map<string, any[]>;
let mockAuthUser: { id: string } | null;
let mockUserData: { role: string; is_active: boolean } | null;

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'mock-cookie' })),
    set: jest.fn(),
  })),
}));

// Mock createServerClient from @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: mockAuthUser },
        error: mockAuthUser ? null : new Error('Not authenticated'),
      })),
    },
    from: (table: string) => createMockQueryBuilder(table),
  })),
}));

// Helper to create mock query builder
function createMockQueryBuilder(tableName: string) {
  const filterConditions: Array<{ column: string; value: any }> = [];
  let insertData: any = null;

  const builder: any = {
    select: (_columns?: string) => {
      return builder;
    },
    eq: (column: string, value: any) => {
      filterConditions.push({ column, value });
      return builder;
    },
    in: (_column: string, _values: any[]) => {
      return builder;
    },
    limit: (_count: number) => {
      return builder;
    },
    single: () => {
      return builder;
    },
    insert: (data: any) => {
      insertData = data;
      return builder;
    },
    then: (resolve: (value: any) => void) => {
      // Handle different table queries
      if (tableName === 'users') {
        return Promise.resolve({
          data: mockUserData,
          error: mockUserData ? null : new Error('User not found'),
        }).then(resolve);
      }

      if (tableName === 'grd_fila' && filterConditions.some(f => f.column === 'estado')) {
        // Workflow check - return empty (no active workflow)
        return Promise.resolve({
          data: [],
          error: null,
        }).then(resolve);
      }

      if (tableName === 'sigesa' && insertData !== null) {
        // Insert sigesa record
        const newId = (mockDatabase.get('sigesa')?.length || 0) + 1;
        mockDatabase.get('sigesa')?.push({ id: newId });
        return Promise.resolve({
          data: { id: newId },
          error: null,
        }).then(resolve);
      }

      if (tableName === 'sigesa_fila' && insertData !== null) {
        // Insert sigesa_fila records
        return Promise.resolve({
          data: null,
          error: null,
        }).then(resolve);
      }

      if (tableName === 'grd_oficial' && insertData !== null) {
        // Insert grd_oficial record
        const newId = (mockDatabase.get('grd_oficial')?.length || 0) + 1;
        mockDatabase.get('grd_oficial')?.push({ id: newId });
        return Promise.resolve({
          data: { id: newId },
          error: null,
        }).then(resolve);
      }

      if (tableName === 'grd_fila' && insertData !== null) {
        // Insert grd_fila records
        return Promise.resolve({
          data: null,
          error: null,
        }).then(resolve);
      }

      if (tableName === 'norma_minsal') {
        // Return empty norma_minsal data
        return Promise.resolve({
          data: [],
          error: null,
        }).then(resolve);
      }

      return Promise.resolve({
        data: mockDatabase.get(tableName) || [],
        error: null,
      }).then(resolve);
    },
  };

  return builder;
}

// Helper to create a minimal Excel file buffer
async function createTestExcelBuffer(rows: Array<Record<string, any>>): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Required headers
  const headers = ['Episodio CMBD', 'Nombre', 'RUT', 'IR GRD Código'];
  worksheet.addRow(headers);

  // Add data rows
  rows.forEach(row => {
    worksheet.addRow([
      row.episodio_CMBD || row.episodio,
      row.nombre || 'Test Patient',
      row.rut || '12345678-9',
      row.ir_grd_codigo || 540,
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  // Return as ArrayBuffer for Blob compatibility
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

// Helper to create FormData with file
// Uses Blob with filename parameter instead of File class for Node.js compatibility
async function createFormDataWithFile(buffer: ArrayBuffer, filename: string): Promise<FormData> {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const formData = new FormData();
  // FormData.append() accepts a third parameter for filename, which works in Node.js
  formData.append('file', blob, filename);
  return formData;
}

describe('POST /api/v1/sigesa/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase = new Map([
      ['sigesa', []],
      ['sigesa_fila', []],
      ['grd_oficial', []],
      ['grd_fila', []],
      ['norma_minsal', []],
    ]);
    mockAuthUser = { id: 'test-user-id' };
    mockUserData = { role: 'encoder', is_active: true };
  });

  describe('Success Cases', () => {
    it('should upload and process a valid Excel file', async () => {
      // Arrange
      const testData = [{ episodio_CMBD: 1001, nombre: 'Juan Pérez', rut: '12345678-9' }];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'test.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert - successResponse returns data directly: { sigesaId, grdId, rowCounts }
      expect(response.status).toBe(201);
      expect(data.sigesaId).toBeDefined();
      expect(data.grdId).toBeDefined();
      expect(data.rowCounts.sigesaRows).toBe(1);
      expect(data.rowCounts.grdRows).toBe(1);
    });

    it('should process multiple rows', async () => {
      // Arrange
      const testData = [
        { episodio_CMBD: 2001 },
        { episodio_CMBD: 2002 },
        { episodio_CMBD: 2003 },
      ];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'multi.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.rowCounts.sigesaRows).toBe(3);
    });

    it('should allow admin to upload', async () => {
      // Arrange
      mockUserData = { role: 'admin', is_active: true };
      const testData = [{ episodio_CMBD: 3001 }];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'admin.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });
  });

  describe('Authentication Cases', () => {
    it('should return 401 when not authenticated', async () => {
      // Arrange
      mockAuthUser = null;
      const testData = [{ episodio_CMBD: 4001 }];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'unauth.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      mockUserData = null;
      const testData = [{ episodio_CMBD: 4002 }];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'notfound.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should return 403 when user is inactive', async () => {
      // Arrange
      mockUserData = { role: 'encoder', is_active: false };
      const testData = [{ episodio_CMBD: 4003 }];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'inactive.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toContain('inactive');
    });

    it('should return 403 when finance tries to upload', async () => {
      // Arrange
      mockUserData = { role: 'finance', is_active: true };
      const testData = [{ episodio_CMBD: 4004 }];
      const buffer = await createTestExcelBuffer(testData);
      const formData = await createFormDataWithFile(buffer, 'finance.xlsx');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Validation Cases', () => {
    it('should return 400 when no file is uploaded', async () => {
      // Arrange
      const formData = new FormData();
      // No file appended

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('No file');
    });

    it('should return 400 for non-Excel file', async () => {
      // Arrange
      const blob = new Blob(['not an excel file'], { type: 'text/plain' });
      const formData = new FormData();
      // Use Blob with filename parameter for Node.js compatibility
      formData.append('file', blob, 'test.txt');

      const request = new NextRequest('http://localhost:3000/api/v1/sigesa/upload', {
        method: 'POST',
        body: formData,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Excel');
    });
  });
});

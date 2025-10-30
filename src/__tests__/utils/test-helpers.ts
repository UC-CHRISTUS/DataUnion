/**
 * Test Helper Utilities
 *
 * Common utilities and fixtures for API route testing.
 */

import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest object for testing
 */
export function createMockNextRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    body,
    headers = {},
    searchParams = {},
  } = options;

  // Build URL with search params
  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Use Next.js compatible RequestInit (no null for signal)
  const requestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  return new NextRequest(urlObj.toString(), requestInit as any);
}

/**
 * Create a mock FormData NextRequest for file uploads
 */
export function createMockFormDataRequest(options: {
  url?: string;
  formData: FormData;
  headers?: Record<string, string>;
}): NextRequest {
  const { url = 'http://localhost:3000', formData, headers = {} } = options;

  // Use Next.js compatible RequestInit (no null for signal)
  const requestInit = {
    method: 'POST',
    headers: {
      ...headers,
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  };

  return new NextRequest(url, requestInit as any);
}

/**
 * Mock params object for dynamic routes
 */
export function createMockParams<T extends Record<string, string>>(
  params: T
): Promise<T> {
  return Promise.resolve(params);
}

/**
 * Extract JSON from NextResponse
 */
export async function getResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Test Fixtures - Sample Data
 */

export const fixtures = {
  ajustes: [
    {
      id: 1,
      codigo: 'AT001',
      AT: 'Ventilación Mecánica',
      valor: 50000,
    },
    {
      id: 2,
      codigo: 'AT002',
      AT: 'Diálisis',
      valor: 30000,
    },
    {
      id: 3,
      codigo: 'AT003',
      AT: 'Tomografía',
      valor: 20000,
    },
  ],

  sigesa: [
    {
      id: 1,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      created_at: '2025-01-16T10:00:00Z',
    },
  ],

  sigesaFilas: [
    {
      id: 1,
      id_archivo_sigesa: 1,
      episodio_CMBD: 1001,
      nombre: 'John Doe',
      rut: 12345678,
      edad: 45,
      sexo: 'M',
      tipo_actividad: 'Hospitalización',
      fecha_ingreso_completa: '2024-01-15',
      fecha_completa: '2024-01-20',
      ir_grd_codigo: 540,
    },
    {
      id: 2,
      id_archivo_sigesa: 1,
      episodio_CMBD: 1002,
      nombre: 'Jane Smith',
      rut: 87654321,
      edad: 32,
      sexo: 'F',
      tipo_actividad: 'Ambulatorio',
      fecha_ingreso_completa: '2024-01-16',
      fecha_completa: '2024-01-18',
      ir_grd_codigo: 541,
    },
  ],

  grdOficial: [
    {
      id: 1,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      created_at: '2025-01-16T10:00:00Z',
    },
  ],

  grdFilas: [
    {
      id: 1,
      episodio: 1001,
      validado: 'SI',
      centro: 'Hospital Central',
      n_folio: 12345,
      rut_paciente: '12345678-9',
      nombre_paciente: 'John Doe',
      tipo_episodio: 'Hospitalización',
      fecha_ingreso: '2024-01-15',
      fecha_alta: '2024-01-20',
      servicios_alta: 'UCI',
      estado_rn: null,
      AT: true,
      AT_detalle: 'Ventilación mecánica',
      monto_AT: 50000,
      tipo_alta: 'Alta médica',
      'IR-GRD': 540,
      peso: 1.5,
      monto_rn: null,
      dias_demora_rescate_hospital: 0,
      pago_demora_rescate: 0,
      pago_outlier_superior: 0,
      documentacion: 'Completa',
      'inlier/outlier': 'inlier',
      grupo_dentro_norma: true,
      dias_estadia: 5,
      precio_base_tramo: 100000,
      valor_GRD: 150000,
      monto_final: 200000,
      id_grd_oficial: 1,
    },
    {
      id: 2,
      episodio: 1002,
      validado: 'NO',
      centro: 'Hospital Norte',
      n_folio: 12346,
      rut_paciente: '87654321-0',
      nombre_paciente: 'Jane Smith',
      tipo_episodio: 'Ambulatorio',
      fecha_ingreso: '2024-01-16',
      fecha_alta: '2024-01-18',
      servicios_alta: 'Consulta',
      estado_rn: null,
      AT: false,
      AT_detalle: null,
      monto_AT: null,
      tipo_alta: 'Alta médica',
      'IR-GRD': 541,
      peso: 0.8,
      monto_rn: null,
      dias_demora_rescate_hospital: 0,
      pago_demora_rescate: 0,
      pago_outlier_superior: 0,
      documentacion: 'Incompleta',
      'inlier/outlier': 'inlier',
      grupo_dentro_norma: true,
      dias_estadia: 2,
      precio_base_tramo: 50000,
      valor_GRD: 40000,
      monto_final: 40000,
      id_grd_oficial: 1,
    },
  ],

  episodioAT: [
    {
      id: 1,
      n_episodio: 1001,
      id_AT: 1,
    },
    {
      id: 2,
      n_episodio: 1001,
      id_AT: 2,
    },
  ],

  normaMinsal: [
    {
      id: 1,
      'IR-GRD': 540,
      peso: 1.5,
    },
    {
      id: 2,
      'IR-GRD': 541,
      peso: 0.8,
    },
  ],
};

/**
 * Assertion helpers
 */

export function expectPaginatedResponse(response: any) {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('total');
  expect(response).toHaveProperty('page');
  expect(response).toHaveProperty('pageSize');
  expect(response).toHaveProperty('totalPages');
  expect(Array.isArray(response.data)).toBe(true);
  expect(typeof response.total).toBe('number');
  expect(typeof response.page).toBe('number');
  expect(typeof response.pageSize).toBe('number');
  expect(typeof response.totalPages).toBe('number');
}

export function expectErrorResponse(response: any) {
  expect(response).toHaveProperty('error');
  expect(typeof response.error).toBe('string');
}

export function expectValidationErrorResponse(response: any) {
  expect(response).toHaveProperty('error');
  expect(response.error).toBe('Validation failed');
  expect(response).toHaveProperty('details');
  expect(Array.isArray(response.details)).toBe(true);
}

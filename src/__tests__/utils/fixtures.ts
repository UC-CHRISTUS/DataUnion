/**
 * Test Fixture Factories
 *
 * Centralized factory functions for ALL test data types.
 * Each factory creates fresh data with sensible defaults that can be overridden.
 *
 * PRINCIPLE: No shared mutable state - each test gets its own isolated data.
 */

export interface MockUser {
  id: number;
  auth_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'encoder' | 'finance';
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockGrdRow {
  id: number;
  episodio: number;
  validado: string;
  centro: string;
  estado?: string;
  id_grd_oficial: number;
  [key: string]: any;
}

export interface MockAjuste {
  id: number;
  codigo: string;
  AT: string;
  valor: number;
}

export interface MockSigesa {
  id: number;
  created_at: string;
}

export interface MockSigesaFila {
  id: number;
  id_archivo_sigesa: number;
  episodio_CMBD: number;
  nombre: string;
  rut: number;
  edad: number;
  sexo: string;
  tipo_actividad: string;
  fecha_ingreso_completa: string;
  fecha_completa: string;
  ir_grd_codigo: number;
}

export interface MockGrdOficial {
  id: number;
  created_at: string;
}

export interface MockEpisodioAT {
  id: number;
  n_episodio: number;
  id_AT: number;
}

export interface MockNormaMinsal {
  id: number;
  'IR-GRD': number;
  peso: number;
}

let userIdCounter = 1;
let grdIdCounter = 1;
let ajusteIdCounter = 1;
let sigesaIdCounter = 1;
let sigesaFilaIdCounter = 1;
let grdOficialIdCounter = 1;
let episodioATIdCounter = 1;
let normaMinsalIdCounter = 1;

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = overrides.id ?? userIdCounter++;
  return {
    id,
    auth_id: `auth-${id}`,
    email: `user${id}@test.com`,
    full_name: `Test User ${id}`,
    role: 'encoder',
    is_active: true,
    must_change_password: false,
    last_login: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockAdmin(overrides: Partial<MockUser> = {}): MockUser {
  return createMockUser({
    role: 'admin',
    full_name: 'Admin User',
    ...overrides,
  });
}

export function createMockEncoder(overrides: Partial<MockUser> = {}): MockUser {
  return createMockUser({
    role: 'encoder',
    full_name: 'Encoder User',
    ...overrides,
  });
}

export function createMockFinance(overrides: Partial<MockUser> = {}): MockUser {
  return createMockUser({
    role: 'finance',
    full_name: 'Finance User',
    ...overrides,
  });
}

export function createMockGrdRow(overrides: Partial<MockGrdRow> = {}): MockGrdRow {
  const id = overrides.id ?? grdIdCounter++;
  return {
    id,
    episodio: 1000 + id,
    validado: 'SI',
    centro: 'Hospital Test',
    estado: 'borrador_encoder',
    id_grd_oficial: 1,
    n_folio: 10000 + id,
    rut_paciente: `12345678-${id}`,
    nombre_paciente: `Patient ${id}`,
    tipo_episodio: 'Hospitalización',
    fecha_ingreso: '2024-01-15',
    fecha_alta: '2024-01-20',
    servicios_alta: 'UCI',
    estado_rn: null,
    AT: false,
    AT_detalle: null,
    monto_AT: null,
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
    ...overrides,
  };
}

export function createMockAjuste(overrides: Partial<MockAjuste> = {}): MockAjuste {
  const id = overrides.id ?? ajusteIdCounter++;
  return {
    id,
    codigo: `AT${String(id).padStart(3, '0')}`,
    AT: `Ajuste Tecnológico ${id}`,
    valor: id * 10000,
    ...overrides,
  };
}

export function createMockSigesa(overrides: Partial<MockSigesa> = {}): MockSigesa {
  const id = overrides.id ?? sigesaIdCounter++;
  return {
    id,
    created_at: new Date(2025, 0, id).toISOString(),
    ...overrides,
  };
}

export function createMockSigesaFila(overrides: Partial<MockSigesaFila> = {}): MockSigesaFila {
  const id = overrides.id ?? sigesaFilaIdCounter++;
  return {
    id,
    id_archivo_sigesa: 1,
    episodio_CMBD: 1000 + id,
    nombre: `Patient ${id}`,
    rut: 10000000 + id,
    edad: 30 + id,
    sexo: id % 2 === 0 ? 'M' : 'F',
    tipo_actividad: 'Hospitalización',
    fecha_ingreso_completa: '2024-01-15',
    fecha_completa: '2024-01-20',
    ir_grd_codigo: 540,
    ...overrides,
  };
}

export function createMockGrdOficial(overrides: Partial<MockGrdOficial> = {}): MockGrdOficial {
  const id = overrides.id ?? grdOficialIdCounter++;
  return {
    id,
    created_at: new Date(2025, 0, 15 + id).toISOString(),
    ...overrides,
  };
}

export function createMockEpisodioAT(overrides: Partial<MockEpisodioAT> = {}): MockEpisodioAT {
  const id = overrides.id ?? episodioATIdCounter++;
  return {
    id,
    n_episodio: 1001,
    id_AT: id,
    ...overrides,
  };
}

export function createMockNormaMinsal(overrides: Partial<MockNormaMinsal> = {}): MockNormaMinsal {
  const id = overrides.id ?? normaMinsalIdCounter++;
  return {
    id,
    'IR-GRD': 540 + id - 1,
    peso: 1.0 + (id - 1) * 0.5,
    ...overrides,
  };
}

export function resetCounters() {
  userIdCounter = 1;
  grdIdCounter = 1;
  ajusteIdCounter = 1;
  sigesaIdCounter = 1;
  sigesaFilaIdCounter = 1;
  grdOficialIdCounter = 1;
  episodioATIdCounter = 1;
  normaMinsalIdCounter = 1;
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import ExcelJS from 'exceljs'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'
import { Console } from 'console'

/**
 * Normalize header string for flexible matching
 * - Lowercase
 * - Trim whitespace
 * - Remove content in parentheses
 */
function normalizeHeader(header: string): string {
  console.log('[normalizeHeader] original header:', header)

  const normalized = header
    .normalize('NFD')
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, '') // quitamos tildes pero conservamos ñ
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trimEnd()

  console.log('[normalizeHeader] normalized header:', `(${normalized})`)
  return normalized
}

/**
 * Map Excel headers to database column names
 */
function mapHeaders(excelHeaders: string[]): Map<number, string> {
  const headerMap = new Map<number, string>()

  // Define all possible header mappings (normalized form → DB column)
  const columnMappings: Record<string, string> = {
    "hospital descripcion": 'hospital_descripcion',
    'episodio cmbd': 'episodio_CMBD',
    'id derivacion': 'id_derivacion',
    'nombre': 'nombre',
    'rut': 'rut',
    'edad en años': 'edad',
    'sexo desc': 'sexo',
    'conjunto dx': 'conjunto_dx',
    'tipo actividad_1': 'tipo_actividad_1',
    'tipo actividad': 'tipo_actividad',
    'tipo ingreso descripcion': 'tipo_ingreso_descripcion',
    "servicio ingreso descripcion": 'servicio_ingreso_descripcion',
    'servicio ingreso codigo': 'servicio_ingreso_codigo',
    'motivo egreso': 'motivo_egreso',
    'motivo egreso descripcion': 'motivo_egreso',
    'medico egreso': 'medico_egreso',
    'medico egreso descripcion': 'medico_egreso',
    'medico alta id': 'medico_alta_id',
    'especialidad servicio egreso': 'especialidad_servicio_egreso',
    'especialidad servicio egreso descripcion': 'especialidad_servicio_egreso',
    'servicio egreso codigo': 'servicio_egreso_codigo',
    'servicio egreso': 'servicio_egreso_descripcion',
    'servicio egreso descripcion': 'servicio_egreso_descripcion',
    'prevision cod': 'prevision_codigo',
    'prevision desc': 'prevision_desc',
    'prevision 2 cod': 'prevision_2_cod',
    'prevision 2 desc': 'prevision_2_desc',
    'ley cod': 'ley_cod',
    'ley desc': 'ley_desc',
    'convenios cod': 'convenios_cod',
    'convenios des': 'convenio_des',
    'servicio salud cod': 'servicio_salud_cod',
    'servicio salud des': 'servicio_salud_des',
    'estancias prequirurgicas int episodio': 'estancias_prequirurgicas_int _episodio',
    'estancias prequirurgicas int -episodio-': 'estancias_prequirurgicas_int _episodio',
    'estancias postquirurgicas int episodio': 'estancias_postquirurgicas_int',
    'estancias postquirurgicas int -episodio-': 'estancias_postquirurgicas_int',
    'em pre-quirurgica': 'em_pre_quirurgica',
    'em post-quirurgica': 'em_post_quirurgica',
    'estancia del episodio': 'estancia_episodio',
    'estancia episodio': 'estancia_episodio',
    'estancia real del episodio': 'estancia_real_episodio',
    'horas de estancia': 'horas_estancia',
    'estancia media': 'estancia_media',
    'peso grd medio': 'peso_grd_medio_todos',
    'peso grd medio todos': 'peso_grd_medio_todos',
    'peso medio [norma ir]': 'peso_medio_norma_ir',
    'iema ir bruto': 'iema_ir_bruto',
    'emaf ir bruta': 'emaf_ir_bruta',
    'impacto estancias evitables brutas': 'impacto_estancias_evitables_brutas',
    'ir gravedad': 'ir_gravedad_desc',
    'ir gravedad desc': 'ir_gravedad_desc',
    'ir gravedad descripción': 'ir_gravedad_desc',
    'ir gravedad descripcion': 'ir_gravedad_desc',
    'ir mortalidad': 'ir_mortalidad_desc',
    'ir mortalidad desc': 'ir_mortalidad_desc',
    'ir mortalidad descripción': 'ir_mortalidad_desc',
    'ir mortalidad descripcion': 'ir_mortalidad_desc',
    'ir tipo grd': 'ir_tipo_grd',
    'ir grd codigo': 'ir_grd_codigo',
    'ir grd': 'ir_grd',
    'ir punto corte inferior': 'ir_punto_corte_inferior',
    'ir punto corte superior': 'ir_punto_corte_superior',
    'em [norma ir]': 'em_norma_ir',
    'estancias [norma ir]': 'estancias_norma_ir',
    'casos [norma ir]': 'casos_norma_ir',
    'fecha ingreso completa': 'fecha_ingreso_completa',
    'fecha completa': 'fecha_completa_egreso',
    'conjunto de servicios traslado': 'conjunto_servicios_traslado',
    'fecha tr1': 'fecha_tr1',
    'fecha tr2': 'fecha_tr2',
    'fecha tr3': 'fecha_tr3',
    'fecha tr4': 'fecha_tr4',
    'fecha tr5': 'fecha_tr5',
    'fecha tr6': 'fecha_tr6',
    'fecha tr7': 'fecha_tr7',
    'fecha tr8': 'fecha_tr8',
    'fecha tr9': 'fecha_tr9',
    'fecha tr10': 'fecha_tr10',
    'e.m. traslados servicio': 'em_traslados_servicios',
    'facturacion total del episodio': 'facturacion_total_episodio',
    'especialidad medica de la intervencion des': 'especialidad_medica_intervencion',
    'ir alta inlier / outlier': 'ir_alta_inlier_outlier',
    'ir alta inlier outlier': 'ir_alta_inlier_outlier',
    'año': 'año',
    'ano': 'año',
    'mes numero': 'mes_numero',
    'diagnostico principal': 'diagnostico_principal',
    'proced 01 principal': 'proced_01_principal',
    'proced 01 principal cod': 'proced_01_principal',
    'proced 01 principal codigo': 'proced_01_principal',
    'conjunto procedimientos secundarios': 'conjunto_procedimientos_secundarios',
    'servicio ingreso codigo_2': 'servicio_ingreso_codigo_2',
    'serviciocod tr1': 'servicio_cod_ tr1',
    'serviciocod tr2': 'servicio_cod_ tr2',
    'serviciocod tr3': 'servicio_cod_ tr3',
    'serviciocod tr4': 'servicio_cod_ tr4',
    'serviciocod tr5': 'servicio_cod_ tr5',
    'serviciocod tr6': 'servicio_cod_ tr6',
    'serviciocod tr7': 'servicio_cod_ tr7',
    'serviciocod tr8': 'servicio_cod_ tr8',
    'serviciocod tr9': 'servicio_cod_ tr9',
    'serviciocod tr10': 'servicio_cod_ tr10',
    'servicio egreso codigo_3': 'servicio_egreso_codigo_3',
  }

  excelHeaders.forEach((header, index) => {
    const normalized = normalizeHeader(header)
    const dbColumn = columnMappings[normalized]
    if (dbColumn) {
      headerMap.set(index, dbColumn)
    }
  })

  return headerMap
}



// function join columns with - prevision_codigo and previosion_desc
function joinPrevision(previsionCodigo: string | null, previsionDesc: string | null): string | null 
{
  if (previsionCodigo && previsionDesc) {
    return `${previsionCodigo} - ${previsionDesc}`
  } else {
    return null
  }
}


function handleConvenio(convenioCod: string | null, supabase: any, tramo: string | null, fecha_ingreso: string | null): Promise<number | null>{
  if (convenioCod == "FNS012") { 
    return getPrecioFNS012(supabase, convenioCod, tramo, fecha_ingreso)

  } else if (convenioCod == "CH0041") {
    return getPrecioCH041(supabase, convenioCod, fecha_ingreso)
  }
  else if (convenioCod == "FNS019") {
    const num = Number(convenioCod)
    return getPrecioFNS019(supabase, convenioCod)
  }
  else if (convenioCod == "FNS026") {
    return getPrecioFNS026(supabase, convenioCod, tramo)
  }
  
  else {
    return Promise.resolve(null)
  }
}

function handlePagoDemoraRescate(convenioCod: string | null , supabase: any,
  fecha_ingreso: string | null,grd: number | null,
  peso_grd: number | null,
  precio_base: number | null,
  dias_demora_rescate: number | null): Promise<number | null>  {

   if (convenioCod == "FNS012") { 
    return getPagoDemoraFNS012(supabase, grd, peso_grd, precio_base, dias_demora_rescate)

  } else if (convenioCod == "CH0041") {
    return getPagoDemoraCH0041(supabase, fecha_ingreso, dias_demora_rescate)
  }
  
  else {
    return Promise.resolve(null)
  }
}


async function getPagoDemoraFNS012(
  supabase: any,
  grd: number | null,
  peso_grd: number | null,
  precio_base: number | null,
  dias_demora_rescate: number | null
): Promise<number | null> {
  if (grd == null) return null

  const grdNum = Number(grd)
  if (isNaN(grdNum)) return null

  const peso = Number(peso_grd)
  const precioBase = Number(precio_base)
  const dias = Number(dias_demora_rescate)

  if ([peso, precioBase, dias].some((v) => isNaN(v))) return null

  try {
    const { data, error } = await supabase
      .from('norma_minsal')
      .select('percentil_75')
      .eq('GRD', grdNum)
      .limit(1)

    if (error) {
      console.error('[getPagoDemoraFNS012] DB error:', error)
      return null
    }

    if (!Array.isArray(data) || data.length === 0) return null

    const p75 = Number(data[0].percentil_75)
    if (isNaN(p75) || p75 === 0) return null

    const numerator = peso * precioBase * dias
    return numerator / p75
  } catch (err) {
    console.error('[getPagoDemoraFNS012] Unexpected error:', err)
    return null
  }
}


async function pagoOutlierSuperior(
  supabase: any,
  codigo_convenio: string | null,
  peso_grd: number | null,
  precio_base: number | null,
  grd: number | null,
  estancia_total: number | null
): Promise<number > {
  if (codigo_convenio !== 'FNS012') return 0

  const peso = Number(peso_grd)
  const precioBase = Number(precio_base)
  const estancia = Number(estancia_total)

  if ([peso, precioBase, estancia].some((v) => isNaN(v))) return 0

  if (grd == null) return 0
  const grdNum = Number(grd)
  if (isNaN(grdNum)) return 0
  try {
    const { data, error } = await supabase
      .from('norma_minsal')
      .select('percentil_75, percentil_50, punto_corte_superior')
      .eq('GRD', grdNum)
      .limit(1)

    if (error) {
      return 0
    }

    if (!Array.isArray(data) || data.length === 0) return 0

    const row = data[0]
    const p75 = Number(row.percentil_75)
    const p50 = Number(row.percentil_50)
    const punto = Number(row.punto_corte_superior)

    if ([p75, p50, punto].some((v) => isNaN(v)) || p75 === 0) return 0

    const periodo_carencia = punto + p50
    const dia_post_carencia = estancia - periodo_carencia

    if (dia_post_carencia <= 0) return 0

    const numerator = dia_post_carencia * peso * precioBase
    return numerator / p75
  } catch (err) {
    return 0
  }
}


function findPesoSectionInList(tramos: any[] | null | undefined, peso_grd_medio_todos: number | null): string | null {
  if (!tramos || peso_grd_medio_todos == null) return null

  const peso = Number(peso_grd_medio_todos)
  if (isNaN(peso)) return null

  for (const row of tramos) {
    const lower = row.limite_inferior != null ? Number(row.limite_inferior) : -Infinity
    const upper = row.limite_superior != null ? Number(row.limite_superior) : Infinity

    if (isNaN(lower) && isNaN(upper)) continue

    if (peso > lower && peso <= upper) {
      return row.tramo ?? null
    }
  }

  return null
}

/**
 * Parse a date string that may be in ISO format (YYYY-MM-DD...) or US format (MM/DD/YYYY[ ...])
 * Returns a Date object or null if invalid.
 */
function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null

  // Try native parser first (handles ISO)
  const iso = new Date(dateStr)
  if (!isNaN(iso.getTime())) return iso

  // Try MM/DD/YYYY (or M/D/YYYY) optionally with time
  const mdy = String(dateStr).trim()
  const mdyMatch = mdy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T].*)?$/)
  if (mdyMatch) {
    const month = Number(mdyMatch[1])
    const day = Number(mdyMatch[2])
    const year = Number(mdyMatch[3])
    if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
      const d = new Date(Date.UTC(year, month - 1, day))
      if (!isNaN(d.getTime())) return d
    }
  }

  return null
}


async function getPrecioFNS012(
  supabase: any,
  convenio: string | null,
  tramo: string | null,
  fecha_ingreso: string | null
): Promise<number | null> {
  if (!convenio || !tramo || !fecha_ingreso) return null

  try {
    const { data, error } = await supabase
      .from('precios_convenios_grd')
      .select('precio, fecha_admision, fecha_fin')
      .eq('convenio', convenio)
      .eq('tramo', tramo)

    if (error) {
      console.error('[getPrecioForConvenioTramo] DB error:', error)
      return null
    }

    if (!Array.isArray(data) || data.length === 0) return null

    const ingresoDate = parseDateString(fecha_ingreso)
    if (!ingresoDate) return null

    for (const row of data) {
      const adm = parseDateString(row.fecha_admision)
      const fin = parseDateString(row.fecha_fin)
      if (!adm || !fin) continue

      if (ingresoDate >= adm && ingresoDate <= fin) {
        const precioNum = row.precio != null ? Number(row.precio) : NaN
        return Number.isNaN(precioNum) ? null : precioNum
      }
    }

    return null
  } catch (err) {
    console.error('[getPrecioForConvenioTramo] Unexpected error:', err)
    return null
  }
}

async function getPrecioCH041(
  supabase: any,
  convenio: string | null,
  fecha_ingreso: string | null
): Promise<number | null> {
  if (!convenio || !fecha_ingreso) return null

  try {
    const { data, error } = await supabase
      .from('precios_convenios_grd')
      .select('precio, fecha_admision, fecha_fin')
      .eq('convenio', convenio)
   

    if (error) {
      return null
    }

    if (!Array.isArray(data) || data.length === 0) return null

    const ingresoDate = parseDateString(fecha_ingreso)
    if (!ingresoDate) return null

    for (const row of data) {
      const adm = parseDateString(row.fecha_admision)
      const fin = parseDateString(row.fecha_fin)
      if (!adm || !fin) continue

      if (ingresoDate >= adm && ingresoDate <= fin) {
        const precioNum = row.precio != null ? Number(row.precio) : NaN
        return Number.isNaN(precioNum) ? null : precioNum
      }
    }

    return null
  } catch (err) {
    return null
  }
}

async function getPrecioFNS019(
  supabase: any,
  convenio: string | null,
): Promise<number | null> {
  if (!convenio) return null

  try {
    const { data, error } = await supabase
      .from('precios_convenios_grd')
      .select('precio')
      .eq('convenio', convenio)
      .limit(1)

    if (error || !Array.isArray(data) || data.length === 0) {
      return null
    }

    const precioNum = data[0].precio != null ? Number(data[0].precio) : NaN
    return Number.isNaN(precioNum) ? null : precioNum
  } catch (err) {
    console.error('[getPrecioConvenio] Unexpected error:', err)
    return null
  }
}

async function getPrecioFNS026(
  supabase: any,
  convenio: string | null,
  tramo: string | null,
): Promise<number | null> {
  if (!convenio) return null

  try {
    const { data, error } = await supabase
      .from('precios_convenios_grd')
      .select('precio')
      .eq('convenio', convenio)
      .eq('tramo', tramo)
      .limit(1)

    if (error || !Array.isArray(data) || data.length === 0) {
      return null
    }

    const precioNum = data[0].precio != null ? Number(data[0].precio) : NaN
    return Number.isNaN(precioNum) ? null : precioNum
  } catch (err) {
    console.error('[getPrecioConvenio] Unexpected error:', err)
    return null
  }
}


async function getPagoDemoraCH0041(
  supabase: any,
  fecha_ingreso: string | null,
  dias_espera: number | null
): Promise<number | null> {
  if (!fecha_ingreso || dias_espera == null) return null

  const dias = Number(dias_espera)
  if (isNaN(dias) || dias <= 0) return null

  try {
    const { data, error } = await supabase
      .from('montos_dias_espera')
      .select('precio, fecha_admision, fecha_fin')

    if (error) {
      return null
    }

    if (!Array.isArray(data) || data.length === 0) return null

    const ingresoDate = parseDateString(fecha_ingreso)
    if (!ingresoDate) return null

    for (const row of data) {
      const adm = parseDateString(row.fecha_admision)
      const fin = parseDateString(row.fecha_fin)
      if (!adm || !fin) continue

      if (ingresoDate >= adm && ingresoDate <= fin) {
        const precioNum = row.precio != null ? Number(row.precio) : NaN
        if (Number.isNaN(precioNum)) return null
        return precioNum * dias
      }
    }

    return null
  } catch (err) {
    console.error('[getpagodemorach0041] Unexpected error:', err)
    return null
  }
}



export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with user session from cookies
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Cookie setting may fail in API routes
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Cookie removal may fail in API routes
            }
          },
        },
      }
    )

    // Verify user is authenticated and has encoder or admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return errorResponse('Unauthorized: Authentication required', 401)
    }

    // Get user role from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('auth_id', user.id)
      .single()

    if (userError || !userData) {
      return errorResponse('User not found', 404)
    }

    if (!userData.is_active) {
      return errorResponse('User is inactive', 403)
    }

    // Check if user has permission to upload (encoder or admin)
    if (userData.role !== 'encoder' && userData.role !== 'admin') {
      return errorResponse('Unauthorized: Only encoders and admins can upload files', 403)
    }

    // ============================================================================
    // WORKFLOW VALIDATION: Check if there's already an active workflow
    // ============================================================================
    const { data: activeFiles, error: workflowError } = await supabase
      .from('grd_fila')
      .select('id_grd_oficial, episodio, estado')
      .in('estado', ['borrador_encoder', 'pendiente_finance', 'borrador_finance', 'pendiente_admin'])
      .limit(1)

    if (workflowError) {
      console.error('[POST /api/v1/sigesa/upload] Workflow check error:', workflowError)
      return errorResponse('Error al verificar workflow activo', 500)
    }

    if (activeFiles && activeFiles.length > 0) {
      const activeFile = activeFiles[0]
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe un archivo en proceso',
          message: 'Solo puede haber un archivo en flujo activo a la vez. Completa o rechaza el archivo actual antes de subir uno nuevo.',
          activeWorkflow: {
            grdId: activeFile.id_grd_oficial,
            episodio: activeFile.episodio,
            estado: activeFile.estado,
          },
        },
        { status: 409 } // Conflict
      )
    }
    // ============================================================================

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('No file uploaded', 400)
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return errorResponse('File must be an Excel file (.xlsx or .xls)', 400)
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse Excel file
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return errorResponse('Excel file is empty', 400)
    }

    // Extract headers from first row
    const headerRow = worksheet.getRow(1)
    const excelHeaders: string[] = []
    headerRow.eachCell((cell: { text: string }, colNumber: number) => {
      excelHeaders[colNumber - 1] = cell.text
    })

    // Map headers to database columns
    const headerMap = mapHeaders(excelHeaders)

    // Parse all data rows
    const rows: any[] = []
    worksheet.eachRow((row: { eachCell: (callback: (cell: any, colNumber: number) => void) => void }, rowNumber: number) => {
      if (rowNumber === 1) return // Skip header row

      const rowData: any = {}
      row.eachCell((cell: { value: any }, colNumber: number) => {
        const dbColumn = headerMap.get(colNumber - 1)
        if (dbColumn) {
          rowData[dbColumn] = cell.value
        }
      })

      // Only add if episodio_CMBD exists (required field)
      if (rowData.episodio_CMBD) {
        rows.push(rowData)
      }
    })

    if (rows.length === 0) {
      return errorResponse('No valid rows found in Excel file', 400)
    }

    // Step 1: Create SIGESA parent record
    const { data: sigesaRecord, error: sigesaError } = await supabase
      .from('sigesa')
      .insert({})
      .select('id')
      .single()

    if (sigesaError || !sigesaRecord) {
      throw sigesaError || new Error('Failed to create SIGESA record')
    }

    const sigesaId = sigesaRecord.id

    // Step 2: Prepare and insert SIGESA rows
    const sigesaFilaRows = rows.map((row) => ({
      ...row,
      id_archivo_sigesa: sigesaId,
    }))

    const { error: sigesaFilaError } = await supabase
      .from('sigesa_fila')
      .insert(sigesaFilaRows)

    if (sigesaFilaError) {
      throw sigesaFilaError
    }

    // Step 3: Create GRD oficial record
    const { data: grdRecord, error: grdError } = await supabase
      .from('grd_oficial')
      .insert({})
      .select('id')
      .single()

    if (grdError || !grdRecord) {
      throw grdError || new Error('Failed to create GRD record')
    }

    const grdId = grdRecord.id

    // Step 4: Transform SIGESA rows to GRD rows
    // First, get peso values from norma_minsal for all ir_grd_codigo values
    const irGrdCodigos = [...new Set(rows.map((r) => r.ir_grd_codigo).filter(Boolean))]
    const { data: normaMinsalData } = await supabase
      .from('norma_minsal')
      .select('GRD, peso_total')
      .in('GRD', irGrdCodigos)

    const pesoMap = new Map<number, number>()
    normaMinsalData?.forEach((item) => {
      if (item.peso_total !== null) {
        pesoMap.set(item.GRD, item.peso_total)
      }
    })

    // Fetch tramos_peso_grd once to avoid repeated DB calls per row
    let tramosData: any[] | null = null
    try {
      const { data: _tramos, error: tramosError } = await supabase
        .from('tramos_peso_grd')
        .select('limite_inferior, limite_superior, tramo')
        .order('limite_inferior', { ascending: true })

      if (tramosError) {
        console.error('[POST] Error fetching tramos_peso_grd:', tramosError)
        tramosData = null
      } else {
        tramosData = Array.isArray(_tramos) ? _tramos : null
      }
    } catch (err) {
      console.error('[POST] Unexpected error fetching tramos:', err)
      tramosData = null
    }

    // Transform each SIGESA row to GRD row
    const grdFilaRowsPromises = rows.map(async (row) => {
    const joinedPrevision = joinPrevision(row.prevision_codigo || null, row.prevision_desc || null)
    const pesoTramo = findPesoSectionInList(tramosData, row.peso_grd_medio_todos)
    const convenioPrecioPromise = await handleConvenio(row.convenios_cod || null, supabase, pesoTramo, row.fecha_ingreso_completa || null)
    const pagoDemoraPromise = await handlePagoDemoraRescate(
      row.convenios_cod || null,
      supabase,
      row.fecha_ingreso_completa || null,
      row.ir_grd || null,
      row.peso_grd_medio_todos || null,
      convenioPrecioPromise,
      row.estancia_real_episodio || null
    )

    // Compute pago outlier superior (only for FNS012 per implementation)
    const pagoOutlier = await pagoOutlierSuperior(
      supabase,
      row.convenios_cod || null,
      row.peso_grd_medio_todos || null,
      convenioPrecioPromise,
      row.ir_grd || null,
      row.estancia_real_episodio || null
    )

      return {
        episodio: Number(row.episodio_CMBD),
        rut_paciente: row.rut ? String(row.rut) : null,
        nombre_paciente: row.nombre || null,
        tipo_episodio: row.tipo_actividad || null,
        fecha_ingreso: row.fecha_ingreso_completa || null,
        fecha_alta: row.fecha_completa_egreso || null,
        servicios_alta: row.servicio_egreso_codigo || null,
        tipo_alta: row.motivo_egreso || null,
        centro: row.hospital_descripcion|| null,
        n_folio: row.id_derivacion || null,
        'IR-GRD': row.ir_grd || null,
        peso: row.peso_grd_medio_todos || null,
        'inlier/outlier': row.ir_alta_inlier_outlier || null,
        dias_estadia: row.estancia_real_episodio || null,
        id_grd_oficial: grdId,
        convenio: joinedPrevision,
        precio_base_tramo: convenioPrecioPromise, 
        dias_demora_rescate_hospital: row.estancia_real_episodio || null,
        pago_demora_rescate: pagoDemoraPromise,
        pago_outlier_superior: pagoOutlier,
        
        // Platform-managed fields (left as null)
        validado: null,
        estado_rn: null,
        AT: null,
        AT_detalle: null,
        monto_AT: null,
        monto_rn: null,
        documentacion: null,
        grupo_dentro_norma: null,
        valor_GRD: null,
        monto_final: null,
      }
    })

    // Insert GRD rows
    const grdFilaRows = await Promise.all(grdFilaRowsPromises)
    const { error: grdFilaError } = await supabase.from('grd_fila').insert(grdFilaRows)

    if (grdFilaError) {
      throw grdFilaError
    }

    // Return success response
    return successResponse(
      {
        sigesaId,
        grdId,
        rowCounts: {
          sigesaRows: rows.length,
          grdRows: rows.length,
        },
      },
      201
    )
  } catch (error) {
    return handleError(error)
  }
}


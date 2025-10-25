import { NextRequest } from 'next/server'
import ExcelJS from 'exceljs'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'

/**
 * Normalize header string for flexible matching
 * - Lowercase
 * - Trim whitespace
 * - Remove content in parentheses
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and content
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
}

/**
 * Map Excel headers to database column names
 */
function mapHeaders(excelHeaders: string[]): Map<number, string> {
  const headerMap = new Map<number, string>()

  // Define all possible header mappings (normalized form → DB column)
  const columnMappings: Record<string, string> = {
    'episodio cmbd': 'episodio_CMBD',
    'nombre': 'nombre',
    'rut': 'rut',
    'edad en años': 'edad',
    'edad': 'edad',
    'sexo': 'sexo',
    'sexo desc': 'sexo',
    'conjunto dx': 'conjunto_dx',
    'tipo actividad': 'tipo_actividad',
    'tipo ingreso': 'tipo_ingreso',
    'tipo ingreso descripción': 'tipo_ingreso',
    'servicio ingreso': 'servicio_ingreso_descripcion',
    'servicio ingreso descripción': 'servicio_ingreso_descripcion',
    'servicio ingreso código': 'servicio_ingreso_codigo',
    'servicio ingreso codigo': 'servicio_ingreso_codigo',
    'motivo egreso': 'motivo_egreso',
    'motivo egreso descripción': 'motivo_egreso',
    'motivo egreso descripcion': 'motivo_egreso',
    'medico egreso': 'medico_egreso',
    'medico egreso descripción': 'medico_egreso',
    'medico egreso descripcion': 'medico_egreso',
    'medico alta id': 'medico_alta_id',
    'especialidad servicio egreso': 'especialidad_servicio_egreso',
    'especialidad servicio egreso descripción': 'especialidad_servicio_egreso',
    'especialidad servicio egreso descripcion': 'especialidad_servicio_egreso',
    'servicio egreso código': 'servicio_egreso_codigo',
    'servicio egreso codigo': 'servicio_egreso_codigo',
    'servicio egreso': 'servicio_egreso_descripcion',
    'servicio egreso descripción': 'servicio_egreso_descripcion',
    'servicio egreso descripcion': 'servicio_egreso_descripcion',
    'prevision cód': 'prevision_codigo',
    'prevision cod': 'prevision_codigo',
    'prevision código': 'prevision_codigo',
    'prevision codigo': 'prevision_codigo',
    'prevision': 'prevision_desc',
    'prevision desc': 'prevision_desc',
    'prevision descripción': 'prevision_desc',
    'prevision descripcion': 'prevision_desc',
    'prevision 2 cod': 'prevision_2_cod',
    'prevision 2 código': 'prevision_2_cod',
    'prevision 2 codigo': 'prevision_2_cod',
    'prevision 2 desc': 'prevision_2_desc',
    'prevision 2 descripción': 'prevision_2_desc',
    'prevision 2 descripcion': 'prevision_2_desc',
    'ley cod': 'ley_cod',
    'ley cód': 'ley_cod',
    'ley código': 'ley_cod',
    'ley codigo': 'ley_cod',
    'ley desc': 'ley_desc',
    'ley descripción': 'ley_desc',
    'ley descripcion': 'ley_desc',
    'convenios cod': 'convenios_cod',
    'convenios cód': 'convenios_cod',
    'convenios código': 'convenios_cod',
    'convenios codigo': 'convenios_cod',
    'convenios des': 'convenio_des',
    'convenios desc': 'convenio_des',
    'convenios descripción': 'convenio_des',
    'convenios descripcion': 'convenio_des',
    'servicio salud cod': 'servicio_salud_cod',
    'servicio salud cód': 'servicio_salud_cod',
    'servicio salud código': 'servicio_salud_cod',
    'servicio salud codigo': 'servicio_salud_cod',
    'servicio salud des': 'servicio_salud_des',
    'servicio salud desc': 'servicio_salud_des',
    'servicio salud descripción': 'servicio_salud_des',
    'servicio salud descripcion': 'servicio_salud_des',
    'estancias prequirurgicas int episodio': 'estancias_prequirurgicas_int _episodio',
    'estancias prequirurgicas int -episodio-': 'estancias_prequirurgicas_int _episodio',
    'estancias postquirurgicas int episodio': 'estancias_postquirurgicas_int',
    'estancias postquirurgicas int -episodio-': 'estancias_postquirurgicas_int',
    'em pre-quirúrgica': 'em_pre_quirurgica',
    'em pre-quirurgica': 'em_pre_quirurgica',
    'em post-quirúrgica': 'em_post_quirurgica',
    'em post-quirurgica': 'em_post_quirurgica',
    'estancia del episodio': 'estancia_episodio',
    'estancia episodio': 'estancia_episodio',
    'estancia real del episodio': 'estancia_real_episodio',
    'horas de estancia': 'horas_estancia',
    'estancia media': 'estancia_media',
    'peso grd medio': 'peso_grd_medio_todos',
    'peso grd medio todos': 'peso_grd_medio_todos',
    'peso medio norma ir': 'peso_medio_norma_ir',
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
    'ir grd código': 'ir_grd_codigo',
    'ir grd codigo': 'ir_grd_codigo',
    'ir grd': 'ir_grd',
    'ir punto corte inferior': 'ir_punto_corte_inferior',
    'ir punto corte superior': 'ir_punto_corte_superior',
    'em norma ir': 'em_norma_ir',
    'estancias norma ir': 'estancias_norma_ir',
    'casos norma ir': 'casos_norma_ir',
    'fecha ingreso completa': 'fecha_ingreso_completa',
    'fecha completa': 'fecha_completa',
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
    'em traslados servicio': 'em_traslados_servicios',
    'facturación total del episodio': 'facturacion_total_episodio',
    'facturacion total del episodio': 'facturacion_total_episodio',
    'facturación total episodio': 'facturacion_total_episodio',
    'facturacion total episodio': 'facturacion_total_episodio',
    'especialidad médica de la intervención': 'especialidad_medica_intervencion',
    'especialidad medica de la intervención': 'especialidad_medica_intervencion',
    'especialidad medica de la intervencion': 'especialidad_medica_intervencion',
    'especialidad médica de la intervencion': 'especialidad_medica_intervencion',
    'especialidad médica de la intervención des': 'especialidad_medica_intervencion',
    'especialidad medica de la intervención des': 'especialidad_medica_intervencion',
    'ir alta inlier / outlier': 'ir_alta_inlier_outlier',
    'ir alta inlier outlier': 'ir_alta_inlier_outlier',
    'año': 'año',
    'ano': 'año',
    'mes número': 'mes_numero',
    'mes numero': 'mes_numero',
    'diagnóstico principal': 'diagnostico_principal',
    'diagnostico principal': 'diagnostico_principal',
    'proced 01 principal': 'proced_01_principal',
    'proced 01 principal cod': 'proced_01_principal',
    'proced 01 principal código': 'proced_01_principal',
    'proced 01 principal codigo': 'proced_01_principal',
    'conjunto procedimientos secundarios': 'conjunto_procedimientos_secundarios',
    'servicio ingreso código_1': 'servicio_ingreso_codigo_1',
    'servicio ingreso codigo_1': 'servicio_ingreso_codigo_1',
    'servicio cod tr1': 'servicio_cod_ tr1',
    'serviciocod tr1': 'servicio_cod_ tr1',
    'servicio cod tr2': 'servicio_cod_ tr2',
    'serviciocod tr2': 'servicio_cod_ tr2',
    'servicio cod tr3': 'servicio_cod_ tr3',
    'serviciocod tr3': 'servicio_cod_ tr3',
    'servicio cod tr4': 'servicio_cod_ tr4',
    'serviciocod tr4': 'servicio_cod_ tr4',
    'servicio cod tr5': 'servicio_cod_ tr5',
    'serviciocod tr5': 'servicio_cod_ tr5',
    'servicio cod tr6': 'servicio_cod_ tr6',
    'serviciocod tr6': 'servicio_cod_ tr6',
    'servicio cod tr7': 'servicio_cod_ tr7',
    'serviciocod tr7': 'servicio_cod_ tr7',
    'servicio cod tr8': 'servicio_cod_ tr8',
    'serviciocod tr8': 'servicio_cod_ tr8',
    'servicio cod tr9': 'servicio_cod_ tr9',
    'serviciocod tr9': 'servicio_cod_ tr9',
    'servicio cod tr10': 'servicio_cod_ tr10',
    'serviciocod tr10': 'servicio_cod_ tr10',
    'servicio egreso código_2': 'servicio_egreso_codigo_2',
    'servicio egreso codigo_2': 'servicio_egreso_codigo_2',
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

/**
 * Parse date string and calculate difference in days
 */
function calculateDaysDiff(fechaAlta: string | null, fechaIngreso: string | null): number {
  if (!fechaAlta || !fechaIngreso) return 0

  try {
    const alta = new Date(fechaAlta)
    const ingreso = new Date(fechaIngreso)

    if (isNaN(alta.getTime()) || isNaN(ingreso.getTime())) return 0

    const diffTime = Math.abs(alta.getTime() - ingreso.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch {
    return 0
  }
}

/**
 * POST /api/v1/sigesa/upload
 * Upload and process a SIGESA Excel file
 */
export async function POST(request: NextRequest) {
  try {
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

    // Transform each SIGESA row to GRD row
    const grdFilaRows = rows.map((row) => {
      const irGrdCodigo = row.ir_grd_codigo ? Number(row.ir_grd_codigo) : null
      const peso = irGrdCodigo ? pesoMap.get(irGrdCodigo) || null : null

      const diasEstadia = calculateDaysDiff(row.fecha_completa, row.fecha_ingreso_completa)

      return {
        episodio: Number(row.episodio_CMBD),
        rut_paciente: row.rut ? String(row.rut) : null,
        nombre_paciente: row.nombre || null,
        tipo_episodio: row.tipo_actividad || null,
        fecha_ingreso: row.fecha_ingreso_completa || null,
        fecha_alta: row.fecha_completa || null,
        servicios_alta: row.servicio_egreso_codigo || null,
        tipo_alta: row.motivo_egreso || null,
        'IR-GRD': irGrdCodigo || 0,
        peso: peso,
        'inlier/outlier': row.ir_alta_inlier_outlier || null,
        dias_estadia: diasEstadia,
        id_grd_oficial: grdId,
        // Platform-managed fields (left as null)
        validado: null,
        centro: null,
        n_folio: null,
        estado_rn: null,
        AT: null,
        AT_detalle: null,
        monto_AT: null,
        monto_rn: null,
        dias_demora_rescate_hospital: null,
        pago_demora_rescate: null,
        pago_outlier_superior: null,
        documentacion: null,
        grupo_dentro_norma: null,
        precio_base_tramo: null,
        valor_GRD: null,
        monto_final: null,
      }
    })

    // Insert GRD rows
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

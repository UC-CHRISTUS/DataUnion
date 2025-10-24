import { NextRequest } from 'next/server'
import ExcelJS from 'exceljs'
import { supabase } from '@/lib/supabase'
import { errorResponse, handleError } from '@/lib/api/response'
import { idSchema } from '@/lib/api/validation'

interface GrdFilaWithAjustes {
  id: number
  episodio: number
  validado: string | null
  centro: string | null
  n_folio: number | null
  rut_paciente: string | null
  nombre_paciente: string | null
  tipo_episodio: string | null
  fecha_ingreso: string | null
  fecha_alta: string | null
  servicios_alta: string | null
  estado_rn: string | null
  AT: boolean | null
  AT_detalle: string | null
  monto_AT: number | null
  tipo_alta: string | null
  'IR-GRD': number
  peso: number | null
  monto_rn: number | null
  dias_demora_rescate_hospital: number | null
  pago_demora_rescate: number | null
  pago_outlier_superior: number | null
  documentacion: string | null
  'inlier/outlier': string | null
  grupo_dentro_norma: boolean | null
  dias_estadia: number | null
  precio_base_tramo: number | null
  valor_GRD: number | null
  monto_final: number | null
  id_grd_oficial: number
  episodio_AT: Array<{
    id: number
    id_AT: number
    ajustes_tecnologias: {
      id: number
      codigo: string | null
      AT: string | null
      valor: number | null
    } | null
  }> | null
}

interface FlattenedRow {
  [key: string]: string | number | boolean | null
}

/**
 * Flatten the ajustes data into separate columns
 */
function flattenAjustes(rows: GrdFilaWithAjustes[]): {
  flattenedRows: FlattenedRow[]
  maxAjustes: number
} {
  // Find the maximum number of ajustes in any row
  const maxAjustes = Math.max(
    ...rows.map((row) => row.episodio_AT?.length || 0),
    0
  )

  const flattenedRows = rows.map((row) => {
    // Start with base row data
    const flatRow: FlattenedRow = {
      id: row.id,
      episodio: row.episodio,
      validado: row.validado,
      centro: row.centro,
      n_folio: row.n_folio,
      rut_paciente: row.rut_paciente,
      nombre_paciente: row.nombre_paciente,
      tipo_episodio: row.tipo_episodio,
      fecha_ingreso: row.fecha_ingreso,
      fecha_alta: row.fecha_alta,
      servicios_alta: row.servicios_alta,
      estado_rn: row.estado_rn,
      AT: row.AT,
      AT_detalle: row.AT_detalle,
      monto_AT: row.monto_AT,
      tipo_alta: row.tipo_alta,
      'IR-GRD': row['IR-GRD'],
      peso: row.peso,
      monto_rn: row.monto_rn,
      dias_demora_rescate_hospital: row.dias_demora_rescate_hospital,
      pago_demora_rescate: row.pago_demora_rescate,
      pago_outlier_superior: row.pago_outlier_superior,
      documentacion: row.documentacion,
      'inlier/outlier': row['inlier/outlier'],
      grupo_dentro_norma: row.grupo_dentro_norma,
      dias_estadia: row.dias_estadia,
      precio_base_tramo: row.precio_base_tramo,
      valor_GRD: row.valor_GRD,
      monto_final: row.monto_final,
      id_grd_oficial: row.id_grd_oficial,
    }

    // Add ajustes columns
    if (row.episodio_AT) {
      row.episodio_AT.forEach((ajuste, index) => {
        const ajusteNum = index + 1
        flatRow[`ajuste_${ajusteNum}_id`] = ajuste.id
        flatRow[`ajuste_${ajusteNum}_codigo`] = ajuste.ajustes_tecnologias?.codigo || null
        flatRow[`ajuste_${ajusteNum}_AT`] = ajuste.ajustes_tecnologias?.AT || null
        flatRow[`ajuste_${ajusteNum}_valor`] = ajuste.ajustes_tecnologias?.valor || null
      })
    }

    // Fill empty ajustes columns with null
    for (let i = (row.episodio_AT?.length || 0) + 1; i <= maxAjustes; i++) {
      flatRow[`ajuste_${i}_id`] = null
      flatRow[`ajuste_${i}_codigo`] = null
      flatRow[`ajuste_${i}_AT`] = null
      flatRow[`ajuste_${i}_valor`] = null
    }

    return flatRow
  })

  return { flattenedRows, maxAjustes }
}

/**
 * Generate Excel columns based on data structure
 */
function generateColumns(maxAjustes: number): Array<{ header: string; key: string; width?: number }> {
  const baseColumns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Episodio', key: 'episodio', width: 15 },
    { header: 'Validado', key: 'validado', width: 15 },
    { header: 'Centro', key: 'centro', width: 20 },
    { header: 'N° Folio', key: 'n_folio', width: 12 },
    { header: 'RUT Paciente', key: 'rut_paciente', width: 15 },
    { header: 'Nombre Paciente', key: 'nombre_paciente', width: 30 },
    { header: 'Tipo Episodio', key: 'tipo_episodio', width: 20 },
    { header: 'Fecha Ingreso', key: 'fecha_ingreso', width: 15 },
    { header: 'Fecha Alta', key: 'fecha_alta', width: 15 },
    { header: 'Servicios Alta', key: 'servicios_alta', width: 20 },
    { header: 'Estado RN', key: 'estado_rn', width: 15 },
    { header: 'AT', key: 'AT', width: 10 },
    { header: 'AT Detalle', key: 'AT_detalle', width: 30 },
    { header: 'Monto AT', key: 'monto_AT', width: 15 },
    { header: 'Tipo Alta', key: 'tipo_alta', width: 15 },
    { header: 'IR-GRD', key: 'IR-GRD', width: 12 },
    { header: 'Peso', key: 'peso', width: 12 },
    { header: 'Monto RN', key: 'monto_rn', width: 15 },
    { header: 'Días Demora Rescate', key: 'dias_demora_rescate_hospital', width: 20 },
    { header: 'Pago Demora Rescate', key: 'pago_demora_rescate', width: 20 },
    { header: 'Pago Outlier Superior', key: 'pago_outlier_superior', width: 20 },
    { header: 'Documentación', key: 'documentacion', width: 20 },
    { header: 'Inlier/Outlier', key: 'inlier/outlier', width: 15 },
    { header: 'Grupo Dentro Norma', key: 'grupo_dentro_norma', width: 20 },
    { header: 'Días Estadía', key: 'dias_estadia', width: 15 },
    { header: 'Precio Base Tramo', key: 'precio_base_tramo', width: 20 },
    { header: 'Valor GRD', key: 'valor_GRD', width: 15 },
    { header: 'Monto Final', key: 'monto_final', width: 15 },
    { header: 'ID GRD Oficial', key: 'id_grd_oficial', width: 15 },
  ]

  // Add ajustes columns
  const ajustesColumns = []
  for (let i = 1; i <= maxAjustes; i++) {
    ajustesColumns.push(
      { header: `Ajuste ${i} ID`, key: `ajuste_${i}_id`, width: 12 },
      { header: `Ajuste ${i} Código`, key: `ajuste_${i}_codigo`, width: 15 },
      { header: `Ajuste ${i} AT`, key: `ajuste_${i}_AT`, width: 20 },
      { header: `Ajuste ${i} Valor`, key: `ajuste_${i}_valor`, width: 15 }
    )
  }

  return [...baseColumns, ...ajustesColumns]
}

/**
 * GET /api/v1/grd/[grdId]/export
 * Export all GRD rows for a specific GRD as an Excel file
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ grdId: string }> }
) {
  try {
    const { grdId } = await params

    // Validate grdId parameter
    const grdIdValidation = idSchema.safeParse(grdId)
    if (!grdIdValidation.success) {
      return errorResponse('Invalid GRD ID', 400)
    }

    // Check if GRD exists
    const { data: grdExists, error: grdError } = await supabase
      .from('grd_oficial')
      .select('id')
      .eq('id', grdIdValidation.data)
      .single()

    if (grdError || !grdExists) {
      return errorResponse('GRD not found', 404)
    }

    // Fetch all GRD rows with ajustes
    const { data: grdFilas, error } = await supabase
      .from('grd_fila')
      .select(
        `
        *,
        episodio_AT (
          id,
          id_AT,
          ajustes_tecnologias (
            id,
            codigo,
            AT,
            valor
          )
        )
      `
      )
      .eq('id_grd_oficial', grdIdValidation.data)
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    if (!grdFilas || grdFilas.length === 0) {
      return errorResponse('No rows found for this GRD', 404)
    }

    // Flatten the data
    const { flattenedRows, maxAjustes } = flattenAjustes(grdFilas as GrdFilaWithAjustes[])

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('GRD Rows')

    // Set columns
    worksheet.columns = generateColumns(maxAjustes)

    // Add rows
    flattenedRows.forEach((row) => {
      worksheet.addRow(row)
    })

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' },
    }

    // Generate buffer (small dataset, no streaming needed)
    const buffer = await workbook.xlsx.writeBuffer()

    // Return buffer directly with download headers
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="grd-${grdIdValidation.data}-${Date.now()}.xlsx"`,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}

"use client";

import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic<any>(
  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
);

// === MULTISELECT EDITOR ===
const AtMultiSelectEditor = React.forwardRef((props: any, ref: any) => {
  const initial = (() => {
    const v = props.value;
    if (!v && props?.data?.AT_detalle)
      return String(props.data.AT_detalle)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    if (!v) return [];
    return String(v)
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  })();

  const [selected, setSelected] = useState<string[]>(initial);
  const options: string[] = (props && props.options) || [];

  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => selected.join(", "),
    isPopup: () => true,
    afterGuiAttached: () => {
      const el = containerRef.current?.querySelector("input");
      if (el) (el as HTMLElement).focus();
    },
  }));

  const toggle = (val: string) => {
    setSelected((prev) => {
      if (prev.includes(val)) return prev.filter((p) => p !== val);
      return [...prev, val];
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-white border p-2 max-h-64 overflow-auto"
    >
      {options.length === 0 && (
        <div className="text-sm text-gray-500">No hay opciones</div>
      )}
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 p-1 hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </div>
  );
});

// === MAIN COMPONENT ===
export default function ExcelEditorSigesa() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [sigesaFiles, setSigesaFiles] = useState<any[]>([]);
  const [selectedSigesaId, setSelectedSigesaId] = useState<string | null>(null);
  const [sigesaPage, setSigesaPage] = useState(1);
  const [sigesaPageSize] = useState(50);
  const [sigesaTotalPages, setSigesaTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [atOptions, setAtOptions] = useState<string[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // === CARGAR ARCHIVOS SIGESA ===
  useEffect(() => {
    const fetchSigesaFiles = async () => {
      try {
        const res = await fetch(`/api/v1/sigesa?page=${sigesaPage}&pageSize=${sigesaPageSize}`);
        if (!res.ok) throw new Error("Error al obtener archivos SIGESA");
        const json = await res.json();

        const arr = Array.isArray(json.data) ? json.data : [];
        setSigesaFiles(arr);
        setSigesaTotalPages(json.totalPages || 1);

        if (arr.length > 0 && !selectedSigesaId) {
          setSelectedSigesaId(arr[0].id);
        }
      } catch (e) {
        console.error("Error fetching sigesa files", e);
      }
    };
    fetchSigesaFiles();
  }, [sigesaPage]);

  // === VALIDACIÓN DE TIPOS ===
  const fieldTypes: Record<string, string> = {
    id: "int",
    rut_paciente: "string",
    nombre_paciente: "string",
    fecha_ingreso: "date",
    fecha_alta: "date",
    monto_final: "number",
  };

  const validateValue = (type: string | undefined, value: any) => {
    if (type === undefined) return { valid: true, parsed: value };
    if (value === null || value === undefined || value === "") return { valid: true, parsed: "" };
    const raw = String(value).trim();
    switch (type) {
      case "int": {
        const n = parseInt(raw, 10);
        return { valid: !isNaN(n), parsed: isNaN(n) ? null : n };
      }
      case "number": {
        const f = parseFloat(raw.replace(",", "."));
        return { valid: !isNaN(f), parsed: isNaN(f) ? null : f };
      }
      case "date": {
        const d = new Date(raw);
        return { valid: !isNaN(d.getTime()), parsed: isNaN(d.getTime()) ? null : d.toISOString() };
      }
      default:
        return { valid: true, parsed: raw };
    }
  };

  const validateRow = (row: any) => {
    const invalid: string[] = [];
    for (const f of Object.keys(fieldTypes)) {
      const { valid } = validateValue(fieldTypes[f], row[f]);
      if (!valid) invalid.push(f);
    }
    row._invalidFields = invalid;
    return row;
  };

const BASE_COLUMN_DEFS = [
  { headerName: "Episodio CMBD", field: "episodio_CMBD", sortable: true },
  { headerName: "Nombre", field: "nombre", sortable: true },
  { headerName: "RUT", field: "rut", sortable: true },
  { headerName: "Edad", field: "edad", sortable: true },
  { headerName: "Sexo", field: "sexo", sortable: true },
  { headerName: "Conjunto Dx", field: "conjunto_dx", sortable: true },
  { headerName: "Tipo Actividad", field: "tipo_actividad", sortable: true },
  { headerName: "Tipo Ingreso (Descripción)", field: "tipo_ingreso", sortable: true },
  { headerName: "Servicio Ingreso (Descripción)", field: "servicio_ingreso_descripcion", sortable: true },
  { headerName: "Servicio Ingreso (Código)", field: "servicio_ingreso_codigo", sortable: true },
  { headerName: "Motivo Egreso (Descripción)", field: "motivo_egreso", sortable: true },
  { headerName: "Medico Egreso (Descripción)", field: "medico_egreso", sortable: true },
  { headerName: "Medico Alta ID", field: "medico_alta_id", sortable: true },
  { headerName: "Especialidad Servicio Egreso (Descripción)", field: "especialidad_servicio_egreso", sortable: true },
  { headerName: "Servicio Egreso (Código)", field: "servicio_egreso_codigo", sortable: true },
  { headerName: "Servicio Egreso (Descripción)", field: "servicio_egreso_descripcion", sortable: true },
  { headerName: "Prevision (Cód)", field: "prevision_codigo", sortable: true },
  { headerName: "Prevision (Desc)", field: "prevision_desc", sortable: true },
  { headerName: "Prevision 2 (Cod)", field: "prevision_2_cod", sortable: true },
  { headerName: "Prevision 2 (DEsc)", field: "prevision_2_desc", sortable: true },
  { headerName: "Ley (Cod)", field: "ley_cod", sortable: true },
  { headerName: "Ley (Desc)", field: "ley_desc", sortable: true },
  { headerName: "Convenios (cod)", field: "convenios_cod", sortable: true },
  { headerName: "Convenios (des)", field: "convenios_des", sortable: true },
  { headerName: "Servicio Salud (cod)", field: "servicio_salud_cod", sortable: true },
  { headerName: "Servicio Salud (des)", field: "servicio_salud_des", sortable: true },
  { headerName: "Estancias Prequirurgicas Int -Episodio-", field: "estancias_prequirurgicas_int_episodio", sortable: true },
  { headerName: "Estancias Postquirurgicas Int -Episodio-", field: "estancias_postquirurgicas_int", sortable: true },
  { headerName: "EM PRE-Quirúrgica", field: "em_pre_quirurgica", sortable: true },
  { headerName: "EM POST-Quirúrgica", field: "em_post_quirurgica", sortable: true },
  { headerName: "Estancia del Episodio", field: "estancia_episodio", sortable: true },
  { headerName: "Estancia real del episodio", field: "estancia_real_episodio", sortable: true },
  { headerName: "Horas de Estancia", field: "horas_estancia", sortable: true },
  { headerName: "Estancia Media", field: "estancia_media", sortable: true },
  { headerName: "Peso GRD Medio (Todos)", field: "peso_grd_medio_todos", sortable: true },
  { headerName: "Peso Medio [Norma IR]", field: "peso_medio_norma_ir", sortable: true },
  { headerName: "IEMA IR Bruto", field: "iema_ir_bruto", sortable: true },
  { headerName: "IEMA IR Bruta", field: "emaf_ir_bruta", sortable: true },
  { headerName: "Impacto (Estancias evitables) Brutas", field: "impacto_estancias_evitables_brutas", sortable: true },
  { headerName: "IR Gravedad (desc)", field: "ir_gravedad_desc", sortable: true },
  { headerName: "IR Mortalidad (desc)", field: "ir_mortalidad_desc", sortable: true },
  { headerName: "IR Tipo GRD", field: "ir_tipo_grd", sortable: true },
  { headerName: "IR GRD (Código)", field: "ir_grd_cod", sortable: true },
  { headerName: "IR GRD", field: "ir_grd", sortable: true },
  { headerName: "IR Punto Corte Inferior", field: "ir_punto_corte_inferior", sortable: true },
  { headerName: "IR Punto Corte Superior", field: "ir_punto_corte_superior", sortable: true },
  { headerName: "EM [Norma IR]", field: "em_norma_ir", sortable: true },
  { headerName: "Estancias [Norma IR]", field: "estancias_norma_ir", sortable: true },
  { headerName: "Casos [Norma IR]", field: "casos_norma_ir", sortable: true },
  { headerName: "Fecha Ingreso completa", field: "fecha_ingreso_completa", sortable: true },
  { headerName: "Fecha Completa", field: "fecha_completa", sortable: true },
  { headerName: "Conjunto de Servicios Traslado", field: "conjunto_servicios_traslado", sortable: true },
  { headerName: "Fecha (tr1)", field: "fecha_tr1", sortable: true },
  { headerName: "Fecha (tr2)", field: "fecha_tr2", sortable: true },
  { headerName: "Fecha (tr3)", field: "fecha_tr3", sortable: true },
  { headerName: "Fecha (tr4)", field: "fecha_tr4", sortable: true },
  { headerName: "Fecha (tr5)", field: "fecha_tr5", sortable: true },
  { headerName: "Fecha (tr6)", field: "fecha_tr6", sortable: true },
  { headerName: "Fecha (tr7)", field: "fecha_tr7", sortable: true },
  { headerName: "Fecha (tr8)", field: "fecha_tr8", sortable: true },
  { headerName: "Fecha (tr9)", field: "fecha_tr9", sortable: true },
  { headerName: "Fecha (tr10)", field: "fecha_tr10", sortable: true },
  { headerName: "E.M. Traslados Servicio", field: "em_traslados_servicio", sortable: true },
  { headerName: "Facturación Total del episodio", field: "facturacion_total_episodio", sortable: true },
  { headerName: "Especialidad médica de la intervención (des)", field: "especialidad_medica_intervencion", sortable: true },
  { headerName: "IR Alta Inlier / Outlier", field: "ir_alta_inlier_outlier", sortable: true },
  { headerName: "Año", field: "año", sortable: true },
  { headerName: "Mes (Número)", field: "mes_numero", sortable: true },
  { headerName: "Diagnóstico Principal", field: "diagnostico_principal", sortable: true },
  { headerName: "Proced 01 Principal (cod)", field: "proced_01_principal", sortable: true },
  { headerName: "Conjunto Procedimientos Secundarios", field: "conjunto_procedimientos_secundarios", sortable: true },
  { headerName: "Servicio Ingreso (Código)_1", field: "servicio_ingreso_codigo_1", sortable: true },
  { headerName: "Servicio(cod) (tr1)", field: "servicio_cod_tr1", sortable: true },
  { headerName: "Servicio(cod) (tr2)", field: "servicio_cod_tr2", sortable: true },
  { headerName: "Servicio(cod) (tr3)", field: "servicio_cod_tr3", sortable: true },
  { headerName: "Servicio(cod) (tr4)", field: "servicio_cod_tr4", sortable: true },
  { headerName: "Servicio(cod) (tr5)", field: "servicio_cod_tr5", sortable: true },
  { headerName: "Servicio(cod) (tr6)", field: "servicio_cod_tr6", sortable: true },
  { headerName: "Servicio(cod) (tr7)", field: "servicio_cod_tr7", sortable: true },
  { headerName: "Servicio(cod) (tr8)", field: "servicio_cod_tr8", sortable: true },
  { headerName: "Servicio(cod) (tr9)", field: "servicio_cod_tr9", sortable: true },
  { headerName: "Servicio(cod) (tr10)", field: "servicio_cod_tr10", sortable: true },
  { headerName: "Servicio Egreso (Código)_2", field: "servicio_egreso_codigo_2", sortable: true },
];

  const enrichColumns = (cols: any[]) => {
    return cols.map((c) => ({
      ...c,
      resizable: true,
      filter: true,
      valueParser: (params: any) => params.newValue,
      valueSetter: (params: any) => {
        const { valid, parsed } = validateValue(fieldTypes[c.field], params.newValue);
        if (valid) {
          params.data[c.field] = parsed;
          if (params.data.id) {
            setModifiedRows((prev) => ({
              ...prev,
              [params.data.id]: {
                ...(prev[params.data.id] || {}),
                ...params.data,
              },
            }));
          }
          return true;
        }
        return false;
      },
      cellClass: (params: any) =>
        params.data?._invalidFields?.includes(c.field)
          ? "bg-red-100 text-red-800 border border-red-300"
          : "",
    }));
  };

  const [columnDefs, setColumnDefs] = useState<any[]>(enrichColumns(BASE_COLUMN_DEFS));

  // === CARGAR FILAS SIGESA ===
  const handleLoadSelectedSigesa = async () => {
    if (!selectedSigesaId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/v1/sigesa/${selectedSigesaId}/rows`);
      if (!res.ok) throw new Error(`Error al cargar SIGESA ${selectedSigesaId}`);

      const data = await res.json();
      const rows = data.data || [];
      setRowData(rows.map(validateRow));
    } catch (e) {
      console.error("Error al cargar filas SIGESA:", e);
    } finally {
      setLoading(false);
    }
  };

  // === DESCARGAR EXCEL ===
  const handleDownload = useCallback(async () => {
    try {
      if (!selectedSigesaId) return;
      const rowsResp = await fetch(`/api/v1/sigesa/${selectedSigesaId}/rows`);
      if (!rowsResp.ok) throw new Error("Error al descargar filas SIGESA");

      const rowsJson = await rowsResp.json();
      const rows = rowsJson?.data ?? [];

      const headers = columnDefs.map((c) => c.headerName ?? c.field);
      const aoa = [
        headers,
        ...rows.map((r: any) => columnDefs.map((col) => r[col.field] ?? "")),
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SIGESA");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer]), `sigesa_${selectedSigesaId}.xlsx`);
    } catch (e) {
      console.error("Error al descargar Excel SIGESA:", e);
    }
  }, [columnDefs, selectedSigesaId]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4"></h1>

      {/* Selector de archivo SIGESA */}
      {sigesaFiles.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <div>
            <label className="block mb-2 font-medium">
              Selecciona archivo SIGESA:
            </label>
            <select
              className="border rounded px-2 py-1"
              value={selectedSigesaId || ""}
              onChange={(e) => setSelectedSigesaId(e.target.value)}
            >
              {sigesaFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.id} {file.nombre ? `- ${file.nombre}` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleLoadSelectedSigesa()}
            disabled={!selectedSigesaId || loading}
            className={`${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded transition`}
          >
            {loading ? "Cargando..." : "Cargar"}
          </button>
        </div>
      )}

      {/* Tabla */}
      {rowData.length > 0 && (
        <>
          <div className="ag-theme-alpine w-full" style={{ height: "520px" }}>
            <AgGridReact
            columnDefs={columnDefs}
            rowModelType="infinite"
            pagination={true}
            paginationPageSize={10}
            localeText={{
                page: 'Página',
                more: 'Más',
                to: 'a',
                of: 'de',
                loadingOoo: 'Cargando...',
                noRowsToShow: 'No hay filas para mostrar',
                pageSize: 'Tamaño de página',
                pageSizeSelectorLabel: '',
                totalRows: 'Total de filas',
            }}
            datasource={{
            getRows: async (params: any) => {
                const page = Math.floor(params.startRow / params.endRow) + 1;
                const res = await fetch(`/api/v1/sigesa/${selectedSigesaId}/rows?page=${page}&pageSize=${params.endRow - params.startRow}`);
                const json = await res.json();
                params.successCallback(json.data, json.total);
            },
        }}
        />
          </div>
        </>
      )}

      {loading && <p className="text-gray-600">Cargando datos SIGESA...</p>}
      {!loading && rowData.length === 0 && (
        <p>No hay datos disponibles. Selecciona un archivo SIGESA para cargar.</p>
      )}
    </div>
  );
}

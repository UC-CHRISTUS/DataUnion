"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic<any>(
  () => import("ag-grid-react").then((m) => m.AgGridReact),
  { ssr: false }
);

// ===================== Constantes & Utils =====================
const NON_EDITABLE_FIELDS = [
  "episodio",
  "tipo_episodio",
  "fecha_ingreso",
  "fecha_alta",
  "servicios_alta",
  "tipo_alta",
  "IR-GRD",
  "inlier/outlier",
];

const LOCALE_ES = {
  page: "Página",
  more: "Más",
  to: "a",
  of: "de",
  loadingOoo: "Cargando...",
  noRowsToShow: "No hay filas para mostrar",
  pageSize: "Tamaño de página",
  pageSizeSelectorLabel: "",
  totalRows: "Total de filas",
};

const FIELD_TYPES: Record<string, string> = {
  validado: "string",
  centro: "string",
  n_folio: "number",
  episodio: "int",
  rut_paciente: "string",
  nombre_paciente: "string",
  tipo_episodio: "string",
  fecha_ingreso: "date",
  fecha_alta: "date",
  servicios_alta: "string",
  estado_rn: "string",
  at: "boolean",
  at_detalle: "string",
  monto_at: "number",
  tipo_alta: "string",
  ir_grd: "int",
  peso: "number",
  monto_rn: "number",
  dias_demora_rescate: "int",
  pago_demora_rescate: "number",
  pago_outlier_superior: "number",
  documentacion: "string",
  inlier_outlier: "string",
  grupo_dentro_nombra: "boolean",
  dias_estadia: "int",
  precio_base_tramo: "number",
  valor_grd: "number",
  monto_final: "number",
};

const BASE_COLUMN_DEFS = [
  { headerName: "Validado", field: "validado", sortable: true },
  { headerName: "Centro", field: "centro", sortable: true },
  { headerName: "N° Folio", field: "n_folio", sortable: true },
  { headerName: "Episodio", field: "episodio", sortable: true },
  { headerName: "RUT Paciente", field: "rut_paciente", sortable: true },
  { headerName: "Nombre Paciente", field: "nombre_paciente", sortable: true },
  { headerName: "Tipo Episodio", field: "tipo_episodio", sortable: true },
  { headerName: "Fecha Ingreso", field: "fecha_ingreso", sortable: true },
  { headerName: "Fecha Alta", field: "fecha_alta", sortable: true },
  { headerName: "Servicios Alta", field: "servicios_alta", sortable: true },
  { headerName: "Estado RN", field: "estado_rn", sortable: true },
  { headerName: "AT", field: "AT", sortable: true },
  { headerName: "AT Detalle", field: "at_detalle", sortable: true },
  { headerName: "Monto AT", field: "monto_at", sortable: true },
  { headerName: "Tipo Alta", field: "tipo_alta", sortable: true },
  { headerName: "IR-GRD", field: "IR-GRD", sortable: true },
  { headerName: "Peso", field: "peso", sortable: true },
  { headerName: "Monto RN", field: "monto_rn", sortable: true },
  { headerName: "Días Demora Rescate", field: "dias_demora_rescate", sortable: true },
  { headerName: "Pago Demora Rescate", field: "pago_demora_rescate", sortable: true },
  { headerName: "Pago Outlier Superior", field: "pago_outlier_superior", sortable: true },
  { headerName: "Documentación", field: "documentacion", sortable: true },
  { headerName: "Inlier/Outlier", field: "inlier/outlier", sortable: true },
  { headerName: "Grupo Dentro Norma", field: "grupo_dentro_norma", sortable: true },
  { headerName: "Días Estadía", field: "dias_estadia", sortable: true },
  { headerName: "Precio Base Tramo", field: "precio_base_tramo", sortable: true },
  { headerName: "Valor GRD", field: "valor_grd", sortable: true },
  { headerName: "Monto Final", field: "monto_final", sortable: true },
];

const LockCellRenderer = (params: any) => (
  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <span style={{ opacity: 0.7 }}>🔒</span>
    <span>{params.value}</span>
  </span>
);

const toBoolLoose = (v: any) => {
  if (v == null || v === "") return null;
  const n = String(v).toLowerCase();
  if (["si", "sí", "s", "yes", "true", "1"].includes(n)) return true;
  if (["no", "n", "false", "0"].includes(n)) return false;
  return null;
};

const validateValue = (type: string | undefined, value: any) => {
  if (!type) return { valid: true, parsed: value };
  if (value === null || value === undefined || value === "")
    return { valid: true, parsed: "" };
  const raw = String(value).trim();
  switch (type) {
    case "int": {
      const n = parseInt(raw, 10);
      return { valid: !isNaN(n), parsed: isNaN(n) ? null : n };
    }
    case "number": {
      const f = parseFloat(raw.replace(/,/g, "."));
      return { valid: !isNaN(f), parsed: isNaN(f) ? null : f };
    }
    case "date": {
      const d = new Date(raw);
      return { valid: !isNaN(d.getTime()), parsed: isNaN(d.getTime()) ? null : d.toISOString() };
    }
    case "boolean": {
      const b = toBoolLoose(raw);
      return { valid: b !== null, parsed: b };
    }
    default:
      return { valid: true, parsed: raw };
  }
};

const validateRow = (row: any) => {
  const invalid: string[] = [];
  for (const f of Object.keys(FIELD_TYPES)) {
    const t = FIELD_TYPES[f];
    const { valid } = validateValue(t, row[f]);
    if (!valid) invalid.push(f);
  }
  row._invalidFields = invalid;
  return row;
};

const fmtYesNo = (v: any) =>
  v === true || v === "true" ? "Sí" : v === false || v === "false" ? "No" : v ?? "";

// marca fila como modificada por episodio
const markModified =
  (setModifiedRows: React.Dispatch<React.SetStateAction<Record<string, any>>>) =>
  (data: any) => {
    if (!data?.episodio) return;
    setModifiedRows((prev) => ({
      ...prev,
      [data.episodio]: { ...(prev[data.episodio] || {}), ...data },
    }));
  };

// flash helper seguro
const safeFlash = (params: any, colField: string) => {
  try {
    params.api.flashCells({ rowNodes: [params.node], columns: [colField] });
  } catch {}
};

// ===================== Editor Multiselección AT =====================
const AtMultiSelectEditor = React.forwardRef((props: any, ref: any) => {
  const { options = [], value } = props;
  const initial = String(value ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );

  const totalValor = useMemo(
    () =>
      selected.reduce((acc, label) => {
        const found = options.find((o: any) => o.label === label);
        return acc + (found ? Number(found.valor) : 0);
      }, 0),
    [selected, options]
  );

  useImperativeHandle(ref, () => ({
    getValue: () => ({ labels: selected.join(", "), monto: totalValor }),
    isPopup: () => true,
  }));

  const applyAndClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    props.stopEditing?.(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") applyAndClose();
    if (e.key === "Escape") props.stopEditing?.(false);
  };

  return (
    <div
      className="bg-white border p-2 shadow-md rounded max-h-64 overflow-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {options.map((opt: any) => (
        <label
          key={opt.label}
          className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected.includes(opt.label)}
            onChange={() => toggle(opt.label)}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span>
            {opt.label} (${Number(opt.valor).toLocaleString("es-CL")})
          </span>
        </label>
      ))}
      <button
        type="button"
        onClick={applyAndClose}
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded"
      >
        Aplicar
      </button>
    </div>
  );
});
AtMultiSelectEditor.displayName = "AtMultiSelectEditor";

// ===================== Página =====================
export default function ExcelEditorAGGrid() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [sigesaFiles, setSigesaFiles] = useState<any[]>([]);
  const [selectedGRDId, setSelectedGRDId] = useState<string | null>(null);
  const [sigesaPage, setSigesaPage] = useState(1);

  const [atOptions, setAtOptions] = useState<{ label: string; valor: number }[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const gridRef = useRef<any>(null);
  const touchModified = markModified(setModifiedRows);

  // ======= Networking helpers
  const fetchJSON = async (url: string) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  };

  const saveRowToBackend = async (episodio: string, data: any) => {
    const clean = { ...data, AT: toBoolLoose(data.AT) };
    const res = await fetch(`/api/v1/grd/rows/${episodio}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clean),
    });
    if (!res.ok) {
      const txt = await res.text();
      let detail = txt;
      try {
        const j = JSON.parse(txt);
        detail = j.message || j.error || res.statusText;
      } catch {}
      throw new Error(`Error al guardar fila ${episodio}: ${detail}`);
    }
    await res.json(); // por si el backend devuelve algo
    return true;
  };

  // ======= Column factory
  const buildColumns = useCallback(
    (cols: any[], atOpts: { label: string; valor: number }[]) =>
      cols.map((c) => {
        const type = FIELD_TYPES[c.field];
        const isNonEditable = NON_EDITABLE_FIELDS.includes(c.field);
        const base: any = {
          ...c,
          resizable: true,
          filter: true,
          editable: !isNonEditable,
          valueParser: (p: any) => p.newValue,
          valueSetter: (p: any) => {
            if (isNonEditable) return false;
            const { valid, parsed } = validateValue(type, p.newValue);
            if (!valid) return safeFlash(p, c.field), false;
            const old = p.data[c.field];
            p.data[c.field] = parsed;
            if (p.data._invalidFields) {
              p.data._invalidFields = p.data._invalidFields.filter((x: string) => x !== c.field);
            }
            if (p.data.episodio && old !== parsed) touchModified(p.data);
            return true;
          },
          cellStyle: (p: any) => {
            if (isNonEditable) return { backgroundColor: "#d7f7d7" };
            const epi = p.data?.episodio;
            const modified = epi && modifiedRows[epi] && modifiedRows[epi][c.field] !== undefined;
            return modified ? { backgroundColor: "#d11" } : {};
          },
        };

        // 🔒 Renderer para no editables
        if (isNonEditable) base.cellRenderer = LockCellRenderer;

        // AT Detalle (editor multiselect)
        if (c.field === "at_detalle") {
          base.editable = true;
          base.singleClickEdit = true;
          base.cellEditor = AtMultiSelectEditor;
          base.cellEditorPopup = true;
          base.cellEditorParams = { options: atOpts };
          base.valueSetter = (p: any) => {
            const v = p.newValue;
            if (v && typeof v === "object") {
              p.data.at_detalle = v.labels ?? "";
              p.data.monto_at = v.monto ?? 0;
            } else {
              p.data.at_detalle = v ?? "";
            }
            touchModified(p.data);
            p.api.refreshCells({
              rowNodes: [p.node],
              columns: ["at_detalle", "monto_at"],
              force: true,
            });
            return true;
          };
        }

        // AT (Sí/No → boolean)
        if (c.field === "AT") {
          base.editable = true;
          base.singleClickEdit = true;
          base.cellEditor = "agSelectCellEditor";
          base.cellEditorParams = { values: ["Sí", "No"] };
          base.valueFormatter = (p: any) => fmtYesNo(p.value);
          base.valueSetter = (p: any) => {
            const raw = p.newValue;
            const next = raw === "Sí" ? true : raw === "No" ? false : p.data.AT;
            const old = p.data.AT;
            p.data.AT = next;
            if (old !== next) touchModified(p.data);
            return true;
          };
          base.cellStyle = (p: any) => {
            const epi = p.data?.episodio;
            const modified = epi && modifiedRows[epi] && modifiedRows[epi]["AT"] !== undefined;
            return { backgroundColor: modified ? "#ffcccc" : "#f3f3f3", fontWeight: 500 };
          };
        }

        // Campos Sí/No (texto normalizado)
        if (["validado", "documentacion"].includes(c.field)) {
          base.editable = true;
          base.singleClickEdit = true;
          base.cellEditor = "agSelectCellEditor";
          base.cellEditorParams = { values: ["Sí", "No"] };
          base.valueFormatter = (p: any) => {
            const v = String(p.value ?? "").toLowerCase();
            return v === "sí" || v === "si" ? "Sí" : v === "no" ? "No" : p.value ?? "";
          };
          base.valueSetter = (p: any) => {
            const nxt = p.newValue === "Sí" || p.newValue === "No" ? p.newValue : p.data[c.field];
            const old = p.data[c.field];
            p.data[c.field] = nxt;
            if (old !== nxt) touchModified(p.data);
            return true;
          };
          base.cellStyle = (p: any) => {
            const epi = p.data?.episodio;
            const modified = epi && modifiedRows[epi] && modifiedRows[epi][c.field] !== undefined;
            return { backgroundColor: modified ? "#ffcccc" : "#f3f3f3", fontWeight: 500 };
          };
        }

        return base;
      }),
    [modifiedRows]
  );

  // ======= Cargas iniciales
  useEffect(() => {
    (async () => {
      try {
        const json = await fetchJSON("/api/v1/grd");
        const arr = Array.isArray(json.data) ? json.data : [];
        setSigesaFiles(arr);
        if (arr.length && !selectedGRDId) setSelectedGRDId(arr[0].id);
      } catch (e) {
        console.error("Error fetching grd files", e);
      }
    })();
  }, [selectedGRDId]);

  useEffect(() => {
    (async () => {
      try {
        const j = await fetchJSON("/api/v1/ajustes");
        const arr = j?.data ?? j ?? [];
        const cleaned = (arr || [])
          .filter((x: any) => x?.AT && x?.valor != null)
          .map((x: any) => ({ label: x.AT, valor: Number(x.valor) }));
        setAtOptions(cleaned);
        setColumnDefs(buildColumns(BASE_COLUMN_DEFS, cleaned));
      } catch (e) {
        console.error("Error loading AT options", e);
        setColumnDefs(buildColumns(BASE_COLUMN_DEFS, []));
      }
    })();
  }, [buildColumns]);

  // primer fetch de filas
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const grd = await fetchJSON("/api/v1/grd");
        if (!grd.data?.length) throw new Error("No hay GRDs disponibles");
        const id = grd.data[0].id;
        const rowsData = await fetchJSON(`/api/v1/grd/${id}/rows`);
        const rows = rowsData.data || [];
        setRowData(rows.map(validateRow));
      } catch (e) {
        console.error("Error fetching GRD data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ======= Acciones
  const handleLoadSelectedGRD = useCallback(async () => {
    if (!selectedGRDId) return;
    try {
      setLoading(true);
      const data = await fetchJSON(`/api/v1/grd/${selectedGRDId}/rows`);
      const rows = data.data || [];
      setRowData(rows.map(validateRow));
    } catch (e) {
      console.error("Error al cargar datos del GRD:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedGRDId]);

  const onPaginationChanged = (params: any) => {
    if (!params.api) return;
    setSigesaPage(params.api.paginationGetCurrentPage() + 1);
    handleLoadSelectedGRD();
  };

  const handleSaveChanges = useCallback(async () => {
    const keys = Object.keys(modifiedRows);
    if (!keys.length) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const results = await Promise.allSettled(
        keys.map((epi) => saveRowToBackend(epi, modifiedRows[epi]))
      );
      const failed = results
        .map((r, i) => (r.status === "rejected" ? keys[i] : null))
        .filter(Boolean) as string[];
      if (failed.length) setSaveError(`Error al guardar las filas: ${failed.join(", ")}`);
      else setModifiedRows({});
    } catch (e) {
      setSaveError("Error al guardar cambios");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }, [modifiedRows]);

  const handleDownload = useCallback(async () => {
    try {
      const grd = await fetchJSON("/api/v1/grd");
      const item = grd?.data?.[0];
      if (!item) return;
      const rowsJson = await fetchJSON(`/api/v1/grd/${item.id}/rows`);
      const rows = rowsJson?.data ?? [];
      if (!columnDefs?.length) return;

      const headers = columnDefs.map((c: any) => c.headerName ?? c.field ?? "");
      const aoa = [
        headers,
        ...rows.map((row: any) =>
          columnDefs.map((col: any) => {
            const val = row[col.field];
            if (val instanceof Date) return val.toISOString();
            if (typeof val === "object" && val !== null) return JSON.stringify(val);
            return val ?? "";
          })
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GRD");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `${item?.nombre || `grd_${item.id}`}.xlsx`);
    } catch (e) {
      console.error("Failed to download GRD excel:", e);
    }
  }, [columnDefs]);

  // ============ DataSource (infinite)
  const datasource = useMemo(
    () => ({
      getRows: async (params: any) => {
        const page = Math.floor(params.startRow / (params.endRow - params.startRow)) + 1;
        const limit = params.endRow - params.startRow;
        try {
          const j = await fetchJSON(
            `/api/v1/grd/${selectedGRDId}/rows?page=${page}&pageSize=${limit}`
          );
          const merged = (j.data || []).map((r: any) =>
            modifiedRows[r.episodio] ? { ...r, ...modifiedRows[r.episodio] } : r
          );
          params.successCallback(merged, j.total);
        } catch (e) {
          params.failCallback();
        } finally {
          setTimeout(() => gridRef.current?.api?.hideOverlay?.(), 600);
        }
      },
    }),
    [selectedGRDId, modifiedRows]
  );

  // ======= Upload Excel (opcional, lo mantengo igual)
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result;
      if (!buf) return;
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.SheetNames[0];
      const ws = wb.Sheets[sheet];
      const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (!json.length) return;
      const headers = json[0];
      const idx = (h: string) => headers.indexOf(h);
      const rows = json.slice(1).map((row: any[]) => ({
        validado: row[idx("Validado")] || "",
        centro: row[idx("Centro")] || "",
        n_folio: row[idx("N° Folio")] || "",
        episodio: row[idx("Episodio")] || "",
        rut_paciente: row[idx("RUT Paciente")] || "",
        nombre_paciente: row[idx("Nombre Paciente")] || "",
        tipo_episodio: row[idx("Tipo Episodio")] || "",
        fecha_ingreso: row[idx("Fecha Ingreso")] || "",
        fecha_alta: row[idx("Fecha Alta")] || "",
        servicios_alta: row[idx("Servicios Alta")] || "",
        estado_rn: row[idx("Estado RN")] || "",
        at: row[idx("AT")] || "",
        at_detalle: row[idx("AT Detalle")] || "",
        monto_at: row[idx("Monto AT")] || "",
        tipo_alta: row[idx("Tipo Alta")] || "",
        ir_grd: row[idx("IR-GRD")] || "",
        peso: row[idx("Peso")] || "",
        monto_rn: row[idx("Monto RN")] || "",
        dias_demora_rescate: row[idx("Días Demora Rescate")] || "",
        pago_demora_rescate: row[idx("Pago Demora Rescate")] || "",
        pago_outlier_superior: row[idx("Pago Outlier Superior")] || "",
        documentacion: row[idx("Documentación")] || "",
        inlier_outlier: row[idx("Inlier/Outlier")] || "",
        grupo_dentro_nombra: row[idx("Grupo Dentro Nombra")] || "",
        dias_estadia: row[idx("Días Estadía")] || "",
        precio_base_tramo: row[idx("Precio Base Tramo")] || "",
        valor_grd: row[idx("Valor GRD")] || "",
        monto_final: row[idx("Monto Final")] || "",
      }));
      setRowData(rows.map(validateRow));
    };
    reader.readAsArrayBuffer(file);
  }, []);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4">📊 Editor</h1>

      {sigesaFiles.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <div>
            <label className="block mb-2 font-medium">Selecciona archivo GRD:</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedGRDId || ""}
              onChange={(e) => setSelectedGRDId(e.target.value)}
            >
              {sigesaFiles.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} {f.nombre ? `- ${f.nombre}` : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLoadSelectedGRD}
            disabled={!selectedGRDId || loading}
            className={`${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded transition`}
          >
            {loading ? "Cargando..." : "Cargar"}
          </button>
        </div>
      )}

      {rowData.length > 0 && (
        <>
          <div className="ag-theme-alpine w-full" style={{ height: 520 }}>
            <AgGridReact
              ref={gridRef}
              columnDefs={columnDefs}
              rowModelType="infinite"
              pagination
              paginationPageSize={10}
              datasource={datasource}
              singleClickEdit
              onCellValueChanged={() => gridRef.current?.api?.showLoadingOverlay?.()}
              onPaginationChanged={onPaginationChanged}
              localeText={LOCALE_ES}
            />
          </div>

          <div className="flex gap-4 mt-4">
            {!!Object.keys(modifiedRows).length && (
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`${isSaving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded transition flex items-center gap-2`}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Guardando...
                  </>
                ) : (
                  <>💾 Guardar cambios ({Object.keys(modifiedRows).length})</>
                )}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Descargar Excel
            </button>
            {/* <label className="ml-auto">
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
              <span className="cursor-pointer border px-3 py-2 rounded hover:bg-gray-50">
                Cargar Excel{filename ? ` (${filename})` : ""}
              </span>
            </label> */}
          </div>

          {saveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-300">
              ❌ {saveError}
            </div>
          )}
        </>
      )}

      {loading && <p className="text-gray-600">Cargando datos del GRD...</p>}
      {!loading && rowData.length === 0 && (
        <p>No hay datos disponibles. Puedes cargar un archivo o esperar que se carguen los datos del GRD.</p>
      )}
    </div>
  );
}
"use client";

import React, { useState, useCallback, useEffect, useRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const NON_EDITABLE_FIELDS = [
  "episodio",
  "tipo_episodio",
  "fecha_ingreso",
  "fecha_alta",
  "servicios_alta",
  "tipo_alta",
  "IR-GRD",          
  "inlier/outlier"   
];

const LockCellRenderer = (params: any) => {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <span style={{ opacity: 0.7 }}>🔒</span>
      <span>{params.value}</span>
    </span>
  );
};

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic<any>(
  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
);

const AtMultiSelectEditor = React.forwardRef((props: any, ref: any) => {
  const { options = [], value } = props;

  const initial = String(value ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const [selected, setSelected] = React.useState<string[]>(initial);

  const toggle = (label: string) => {
    setSelected(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    );
  };

  const totalValor = React.useMemo(() => {
    return selected.reduce((acc, label) => {
      const found = options.find((o: any) => o.label === label);
      return acc + (found ? Number(found.valor) : 0);
    }, 0);
  }, [selected, options]);

  React.useImperativeHandle(ref, () => ({
    getValue: () => ({
      labels: selected.join(", "),
      monto: totalValor,
    }),
    isPopup: () => true,
  }));

  const applyAndClose = (e?: React.MouseEvent) => {
    e?.stopPropagation(); 
    if (typeof props.stopEditing === "function") {
      props.stopEditing(true); // commit
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") applyAndClose();
    if (e.key === "Escape" && typeof props.stopEditing === "function") {
      props.stopEditing(false); // cancel
    }
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

export default function ExcelEditorAGGrid() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [sigesaFiles, setSigesaFiles] = useState<any[]>([]);
  const [selectedGRDId, setSelectedGRDId] = useState<string | null>(null);
  const [sigesaPage, setSigesaPage] = useState(1);

  useEffect(() => {
    const fetchSigesaFiles = async () => {
      try {
        const res = await fetch('/api/v1/grd');
        if (!res.ok) return;
        const json = await res.json();
        const arr = Array.isArray(json.data) ? json.data : [];
        setSigesaFiles(arr);
        if (arr.length > 0 && !selectedGRDId) {
          setSelectedGRDId(arr[0].id);
        }
      } catch (e) {
        console.error('Error fetching grd files', e);
      }
    };
    fetchSigesaFiles();
  }, []);

  const [atOptions, setAtOptions] = useState<string[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const saveRowToBackend = async (episodio: string, rowData: any) => {
    try {

      const cleanRowData = Object.fromEntries(
      Object.entries(rowData).map(([k, v]) => [k, v === '' ? null : v])
    );
      const res = await fetch(`/api/v1/grd/rows/${episodio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanRowData)
      });
      
      if (!res.ok) {
        let errorDetail;
        const responseText = await res.text();
        console.error('Respuesta error completa:', responseText);
        
        try {
          const errorJson = JSON.parse(responseText);
          errorDetail = errorJson.message || errorJson.error || res.statusText;
        } catch {
          errorDetail = responseText || `${res.status} ${res.statusText}`;
        }
        
        throw new Error(`Error al guardar fila ${episodio}: ${errorDetail}`);
      }

      const responseData = await res.json();
      console.log('Respuesta exitosa:', responseData);
      
      return true;
    } catch (e) {
      console.error('Error saving row:', e);
      throw e;
    }
  };

  const gridRef = useRef<any>(null);
  
  const handleSaveClick = () => {
    if (Object.keys(modifiedRows).length === 0) return;
    setShowConfirmModal(true);
  };

  const handleSaveChanges = async () => {
    if (Object.keys(modifiedRows).length === 0) return;

    setShowConfirmModal(false);
    setIsSaving(true);
    setSaveError(null);
    try {
      const results = await Promise.allSettled(
        Object.entries(modifiedRows).map(([episodio, data]) =>
          saveRowToBackend(episodio, data)
        )
      );

      const errors = results
        .map((r, i) => r.status === 'rejected' ? Object.keys(modifiedRows)[i] : null)
        .filter(Boolean);

      if (errors.length > 0) {
        setSaveError(`Error al guardar las filas: ${errors.join(', ')}`);
      } else {
        setModifiedRows({});
      }
    } catch (e) {
      setSaveError('Error al guardar cambios');
      console.error('Error saving changes:', e);
    } finally {
      setIsSaving(false);
    }
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
    { headerName: "AT", field: "at", sortable: true },
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
    { headerName: "Grupo Dentro Nombra", field: "grupo_dentro_nombra", sortable: true },
    { headerName: "Días Estadía", field: "dias_estadia", sortable: true },
    { headerName: "Precio Base Tramo", field: "precio_base_tramo", sortable: true },
    { headerName: "Valor GRD", field: "valor_grd", sortable: true },
    { headerName: "Monto Final", field: "monto_final", sortable: true }
  ];

  const [columnDefs, setColumnDefs] = useState<any[]>([]);

  const fieldTypes: Record<string, string> = {
    validado: 'string',
    centro: 'string',
    n_folio: 'number',
    episodio: 'int',
    rut_paciente: 'string',
    nombre_paciente: 'string',
    tipo_episodio: 'string',
    fecha_ingreso: 'date',
    fecha_alta: 'date',
    servicios_alta: 'string',
    estado_rn: 'string',
    at: 'boolean',
    at_detalle: 'string',
    monto_at: 'number',
    tipo_alta: 'string',
    ir_grd: 'int',
    peso: 'number',
    monto_rn: 'number',
    dias_demora_rescate: 'int',
    pago_demora_rescate: 'number',
    pago_outlier_superior: 'number',
    documentacion: 'string',
    inlier_outlier: 'string',
    grupo_dentro_nombra: 'boolean',
    dias_estadia: 'int',
    precio_base_tramo: 'number',
    valor_grd: 'number',
    monto_final: 'number',
  };

  const validateValue = (type: string | undefined, value: any) => {
    if (type === undefined) return { valid: true, parsed: value };
    if (value === null || value === undefined || value === '') return { valid: true, parsed: '' };
    const raw = String(value).trim();
    switch (type) {
      case 'int': {
        const n = parseInt(raw, 10);
        return { valid: !isNaN(n), parsed: isNaN(n) ? null : n };
      }
      case 'number': {
        const normalized = raw.replace(/,/g, '.');
        const f = parseFloat(normalized);
        return { valid: !isNaN(f), parsed: isNaN(f) ? null : f };
      }
      case 'date': {
        const d = new Date(raw);
        return { valid: !isNaN(d.getTime()), parsed: isNaN(d.getTime()) ? null : d.toISOString() };
      }
      case 'boolean': {
        const v = raw.toLowerCase();
        if (['si', 'sí', 's', 'yes', 'true', '1'].includes(v)) return { valid: true, parsed: true };
        if (['no', 'n', 'false', '0'].includes(v)) return { valid: true, parsed: false };
        return { valid: false, parsed: null };
      }
      default:
        return { valid: true, parsed: raw };
    }
  };

  const validateRow = (row: any) => {
    const invalid: string[] = [];
    for (const f of Object.keys(fieldTypes)) {
      const type = fieldTypes[f];
      const val = row[f];
      const { valid } = validateValue(type, val);
      if (!valid) invalid.push(f);
    }
    row._invalidFields = invalid;
    return row;
  };

  const YES_NO_OPTIONS = ["Sí", "No"];

  const enrichColumns = (cols: any[], atOpts: string[]) => {
  return cols.map((c) => {
    const type = fieldTypes[c.field];
    const isNonEditable = NON_EDITABLE_FIELDS.includes(c.field);

    const base: any = {
      ...c,
      resizable: true,
      filter: true,
      editable: !isNonEditable,

      valueParser: (params: any) => params.newValue,
      valueSetter: (params: any) => {
        if (isNonEditable) return false;

        const newVal = params.newValue;
        const { valid, parsed } = validateValue(type, newVal);

        if (valid) {
          const oldValue = params.data[c.field];
          params.data[c.field] = parsed;

          if (params.data._invalidFields) {
            params.data._invalidFields = params.data._invalidFields.filter((x: string) => x !== c.field);
          }

          if (params.data.episodio && oldValue !== parsed) {
            setModifiedRows(prev => ({
              ...prev,
              [params.data.episodio]: {
                ...(prev[params.data.episodio] || {}),
                ...params.data
              }
            }));
          }
          return true;
        }

        try { params.api.flashCells({ rowNodes: [params.node], columns: [params.column] }); } catch (_e) {}
        return false;
      },

      cellStyle: (params: any) => {
        if (isNonEditable) {
          return { backgroundColor: "#d7f7d7" };
        }

        const episodio = params.data?.episodio;
        const wasModified =
          episodio && modifiedRows[episodio] && modifiedRows[episodio][c.field] !== undefined;

        if (wasModified) {
          return { backgroundColor: "#d11" };
        }

        return {};
      }
    };

    if (c.field === "at_detalle") {
  base.editable = true;
  base.singleClickEdit = true;
  base.cellEditor = AtMultiSelectEditor;   
  base.cellEditorPopup = true;
  base.cellEditorParams = { options: atOpts };

  base.valueParser = (p: any) => p.newValue;

  base.valueSetter = (params: any) => {
    const v = params.newValue;


    if (v && typeof v === "object") {
      params.data.at_detalle = v.labels ?? "";
      params.data.monto_at   = v.monto  ?? 0;
    } else {

      params.data.at_detalle = v ?? "";

    }

    if (params.data.episodio) {
      setModifiedRows(prev => ({
        ...prev,
        [params.data.episodio]: {
          ...(prev[params.data.episodio] || {}),
          ...params.data,
        },
      }));
    }


    params.api.refreshCells({
      rowNodes: [params.node],
      columns: ["at_detalle", "monto_at"],
      force: true,
    });

    return true;
  };
}


if (["at", "validado", "documentacion"].includes(c.field)) {
  base.cellEditor = "agSelectCellEditor";
  base.cellEditorParams = {
    values: YES_NO_OPTIONS
  };
  base.singleClickEdit = true;

  base.valueParser = (params: any) => {
    const raw = String(params.newValue ?? "").toLowerCase();
    if (["sí", "si", "s", "yes", "true", "1"].includes(raw)) return true;
    if (["no", "n", "false", "0"].includes(raw)) return false;
    return null;
  };

  base.valueFormatter = (params: any) => {
    if (params.value === true) return "Sí";
    if (params.value === false) return "No"; 
    
  };

  base.cellStyle = (params: any) => ({
    color: "#111", 
    backgroundColor:
      params.value === true || params.value === false
        ? "#ffffff"
        : "#f2f2f2" 
  });
}
    if (isNonEditable) {
      base.cellRenderer = LockCellRenderer;
    }

    return base;
  });
};


  useEffect(() => {
    setColumnDefs(enrichColumns(BASE_COLUMN_DEFS, []));
  }, []);
  const [filename, setFilename] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

useEffect(() => {
  const fetchATOptions = async () => {
    try {
      const res = await fetch('/api/v1/ajustes');
      if (!res.ok) return;

      const json = await res.json();
      const arr = json?.data ?? json;

      const cleaned = (arr ?? [])
  .filter((x: any) => x?.AT && x?.valor != null)
  .map((x: any) => ({ label: x.AT, valor: Number(x.valor) }));
setAtOptions(cleaned);
setColumnDefs(enrichColumns(BASE_COLUMN_DEFS, cleaned));
    } catch (e) {
      console.error('Error loading AT options', e);
    }
  };

  fetchATOptions();
}, []);



  useEffect(() => {
    const fetchGRDData = async () => {
      try {
        setLoading(true);
        const grdResponse = await fetch('/api/v1/grd');
        if (!grdResponse.ok) {
          throw new Error('Error al obtener lista de GRD');
        }
        const grdData = await grdResponse.json();
        
        if (!grdData.data || grdData.data.length === 0) {
          throw new Error('No hay GRDs disponibles');
        }

        const grdId = grdData.data[0].id;
        const rowsResponse = await fetch(`/api/v1/grd/${grdId}/rows`);
        if (!rowsResponse.ok) {
          throw new Error('Error al obtener filas del GRD');
        }
  const rowsData = await rowsResponse.json();
  console.log(rowsData)
  const rows = rowsData.data || [];
  setRowData(rows.map(validateRow));
      } catch (error) {
        console.error('Error fetching GRD data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGRDData();
  }, []);

  const handleLoadSelectedGRD = async () => {
  if (!selectedGRDId) return;

  try {
    setLoading(true);
    const res = await fetch(`/api/v1/grd/${selectedGRDId}/rows`);
    if (!res.ok) throw new Error(`Error al cargar GRD ${selectedGRDId}`);

    const data = await res.json();
    const rows = data.data || [];

    console.log("Datos cargados del GRD:", selectedGRDId, rows);
    setRowData(rows.map(validateRow));
  } catch (e) {
    console.error("Error al cargar datos del GRD:", e);
  } finally {
    setLoading(false);
  }
};

const onPaginationChanged = (params: any) => {
  if (params.api) {
    const currentPage = params.api.paginationGetCurrentPage() + 1;
    setSigesaPage(currentPage);
    handleLoadSelectedGRD(); 
  }
};

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFilename(file.name);
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) return;

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        if (jsonData.length === 0) return;

        const headers = jsonData[0];
        const rows = jsonData.slice(1).map((row: any[]) => {
          const obj: any = {
            validado: row[headers.indexOf('Validado')] || '',
            centro: row[headers.indexOf('Centro')] || '',
            n_folio: row[headers.indexOf('N° Folio')] || '',
            episodio: row[headers.indexOf('Episodio')] || '',
            rut_paciente: row[headers.indexOf('RUT Paciente')] || '',
            nombre_paciente: row[headers.indexOf('Nombre Paciente')] || '',
            tipo_episodio: row[headers.indexOf('Tipo Episodio')] || '',
            fecha_ingreso: row[headers.indexOf('Fecha Ingreso')] || '',
            fecha_alta: row[headers.indexOf('Fecha Alta')] || '',
            servicios_alta: row[headers.indexOf('Servicios Alta')] || '',
            estado_rn: row[headers.indexOf('Estado RN')] || '',
            at: row[headers.indexOf('AT')] || '',
            at_detalle: row[headers.indexOf('AT Detalle')] || '',
            monto_at: row[headers.indexOf('Monto AT')] || '',
            tipo_alta: row[headers.indexOf('Tipo Alta')] || '',
            ir_grd: row[headers.indexOf('IR-GRD')] || '',
            peso: row[headers.indexOf('Peso')] || '',
            monto_rn: row[headers.indexOf('Monto RN')] || '',
            dias_demora_rescate: row[headers.indexOf('Días Demora Rescate')] || '',
            pago_demora_rescate: row[headers.indexOf('Pago Demora Rescate')] || '',
            pago_outlier_superior: row[headers.indexOf('Pago Outlier Superior')] || '',
            documentacion: row[headers.indexOf('Documentación')] || '',
            inlier_outlier: row[headers.indexOf('Inlier/Outlier')] || '',
            grupo_dentro_nombra: row[headers.indexOf('Grupo Dentro Nombra')] || '',
            dias_estadia: row[headers.indexOf('Días Estadía')] || '',
            precio_base_tramo: row[headers.indexOf('Precio Base Tramo')] || '',
            valor_grd: row[headers.indexOf('Valor GRD')] || '',
            monto_final: row[headers.indexOf('Monto Final')] || ''
          };
          return obj;
        });

  setRowData(rows.map(validateRow));
      };

      reader.readAsArrayBuffer(file);
    },
    []
  );

  const datasource = {
  getRows: async (params: any) => {
    const page = Math.floor(params.startRow / params.endRow) + 1;
    const limit = params.endRow - params.startRow;

    try {
      const res = await fetch(
        `/api/v1/grd/${selectedGRDId}/rows?page=${page}&pageSize=${limit}`
      );
      const json = await res.json();
      const mergedData = (json.data || []).map((row: any) => {
        const modified = modifiedRows[row.episodio];
        return modified ? { ...row, ...modified } : row;
      });

      params.successCallback(mergedData, json.total);
    } catch (error) {
      params.failCallback();
    } finally {
      setTimeout(() => {
        if (gridRef.current?.api) {
          gridRef.current.api.hideOverlay();
        }
      }, 600); 
    }
  },
};


  const handleDownload = useCallback(async () => {
    try {
      const grdResp = await fetch('/api/v1/grd');
      if (!grdResp.ok) {
        console.error('Error fetching GRD list for download');
        return;
      }
      const grdJson = await grdResp.json();
      const grdItem = grdJson?.data?.[0];
      if (!grdItem) {
        console.warn('No GRD available to download');
        return;
      }

      const grdId = grdItem.id;
      const rowsResp = await fetch(`/api/v1/grd/${grdId}/rows`);
      if (!rowsResp.ok) {
        console.error('Error fetching GRD rows for download');
        return;
      }
      const rowsJson = await rowsResp.json();
      const rows = rowsJson?.data ?? [];

      if (!columnDefs || columnDefs.length === 0) {
        console.warn('No column definitions available to build export');
        return;
      }

      const headers = columnDefs.map((c) => c.headerName ?? c.field ?? '');
      const aoa = [
        headers,
        ...rows.map((row: any) =>
          columnDefs.map((col: any) => {
            const val = row[col.field];
            if (val instanceof Date) return val.toISOString();
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);
            return val ?? '';
          })
        ),
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'GRD');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      const suggestedName = grdItem?.nombre || `grd_${grdId}`;
      saveAs(blob, `${suggestedName}.xlsx`);
    } catch (e) {
      console.error('Failed to download GRD excel:', e);
    }
  }, [columnDefs]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4">📊 Editor </h1>

    {sigesaFiles.length > 0 && (
    <div className="mb-4 flex items-center gap-3" >
      <div>
        <label className="block mb-2 font-medium">Selecciona archivo GRD:</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedGRDId || ''}
          onChange={e => setSelectedGRDId(e.target.value)}
        >
          {sigesaFiles.map(file => (
          <option key={file.id} value={file.id}>
            {file.id} {file.nombre ? `- ${file.nombre}` : ''}
          </option>
        ))}
        </select>
      </div>

    <button
      onClick={() => handleLoadSelectedGRD()}
      disabled={!selectedGRDId || loading}
      className={`${
        loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
      } text-white px-4 py-2 rounded transition`}
        >
      {loading ? 'Cargando...' : 'Cargar'}
    </button>
    </div>
    )}

      {rowData.length > 0 && (
        <>
          <div className="ag-theme-alpine w-full" style={{ height: "520px" }}>
            <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowModelType="infinite"
            pagination={true}
            paginationPageSize={10}
            datasource={datasource}
            singleClickEdit={true}
            onCellValueChanged={() => {
              if (gridRef.current?.api) {
                gridRef.current.api.showLoadingOverlay();
              }
            }}
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
            
        />
          </div>

          <div className="flex gap-4 mt-4">
            {Object.keys(modifiedRows).length > 0 && (
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`${
                  isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-4 py-2 rounded transition flex items-center gap-2`}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    💾 Guardar cambios ({Object.keys(modifiedRows).length})
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Descargar Excel
            </button>
          </div>
          {saveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-300">
              ❌ {saveError}
            </div>
          )}
        </>
      )}

      {loading && <p className="text-gray-600">Cargando datos del GRD...</p>}
      {!loading && rowData.length === 0 && <p>No hay datos disponibles. Puedes cargar un archivo o esperar que se carguen los datos del GRD.</p>}
    </div>
  );
}

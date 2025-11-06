"use client";

import React, { useState, useCallback, useEffect, useRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SubmitConfirmModal from "./SubmitConfirmModal";
import RejectModal from "./RejectModal";

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

// Campos editables por Encoder
const ENCODER_EDITABLE_FIELDS = ['AT', 'AT_detalle', 'centro', 'documentacion', 'dias_demora_rescate_hospital', 'pago_demora_rescate',
  'pago_outlier_superior'];

// Campos editables por Finance
const FINANCE_EDITABLE_FIELDS = ['validado', 'n_folio', 'estado_rn', 'monto_rn'];

// Admin NO edita ningún campo (solo visualiza)
const ADMIN_EDITABLE_FIELDS: string[] = [];

// Campos de SIGESA que SIEMPRE están bloqueados (datos originales)
const SIGESA_READONLY_FIELDS = [
  'episodio', 'tipo_episodio', 'fecha_ingreso', 'fecha_alta',
  'servicios_alta', 'tipo_alta', 'IR-GRD', 'inlier/outlier', 'nombre_paciente', 'dias_estadia',
  'peso', 'grupo_dentro_norma', 'precio_base_tramo',
  'valor_grd', 'monto_final'
];

  const LockCellRenderer = (params: any) => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <span style={{ marginRight: 4 }}>🔒</span>
        <span>{params.value != null ? params.value : ""}</span>
      </div>
    );
  };

  // Función para determinar si un campo es editable según rol y estado del workflow
  const isFieldEditable = (field: string, userRole?: string, workflowEstado?: string): boolean => {
    // Campos SIGESA siempre bloqueados
    if (SIGESA_READONLY_FIELDS.includes(field)) {
      return false;
    }

    // Si no hay rol o estado, bloquear por defecto
    if (!userRole || !workflowEstado) {
      return false;
    }

    // Admin NUNCA edita (solo visualiza)
    if (userRole === 'admin') {
      return false;
    }

    // Encoder: solo puede editar 'at' y 'at_detalle' en estado 'borrador_encoder' o 'rechazado'
    if (userRole === 'encoder') {
      if (!['borrador_encoder', 'rechazado'].includes(workflowEstado)) {
        return false;
      }
      return ENCODER_EDITABLE_FIELDS.includes(field);
    }

    // Finance: solo puede editar sus campos en 'pendiente_finance' o 'borrador_finance'
    if (userRole === 'finance') {
      if (!['pendiente_finance', 'borrador_finance'].includes(workflowEstado)) {
        return false;
      }
      return FINANCE_EDITABLE_FIELDS.includes(field);
    }

    return false;
  };

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic<any>(

  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
) as any;

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
      props.stopEditing(true); 
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") applyAndClose();
    if (e.key === "Escape" && typeof props.stopEditing === "function") {
      props.stopEditing(false); 
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

interface ExcelEditorProps {
  role?: 'admin' | 'encoder' | 'finance';
  grdId?: string;
  estado?: 'borrador_encoder' | 'pendiente_finance' | 'borrador_finance' | 'pendiente_admin' | 'aprobado' | 'exportado' | 'rechazado';
}

export default function ExcelEditorAGGrid({ role = 'encoder', grdId: grdIdProp, estado = 'borrador_encoder' }: ExcelEditorProps) {
  // Usar grdId de props o cargar el primero disponible (fallback temporal)
  const [grdId, setGrdId] = useState<string | null>(grdIdProp || null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [sigesaPage, setSigesaPage] = useState(1);

  // Estados para workflow
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    if (!grdId) {
      const fetchFirstGRD = async () => {
        try {
          const res = await fetch('/api/v1/grd');
          if (!res.ok) return;
          const json = await res.json();
          const arr = Array.isArray(json.data) ? json.data : [];
          if (arr.length > 0) {
            setGrdId(arr[0].id);
          }
        } catch (e) {
          console.error('Error fetching first grd', e);
        }
      };
      fetchFirstGRD();
    }
  }, [grdId]);

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
  const handleSubmitEncoder = async () => {
    if (!grdId) {
      setSubmitError('No hay archivo GRD seleccionado');
      return;
    }

    if (Object.keys(modifiedRows).length > 0) {
      setSubmitError('Debes guardar los cambios antes de entregar');
      return;
    }

    setShowSubmitModal(false);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/v1/grd/${grdId}/submit-encoder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al entregar archivo');
      }

      alert('✅ Archivo entregado a Finanzas exitosamente');
      router.push('/dashboard');
    } catch (e: any) {
      setSubmitError(e.message || 'Error al entregar archivo');
      console.error('Error submitting to finance:', e);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSubmitFinance = async () => {
    if (!grdId) {
      setSubmitError('No hay archivo GRD seleccionado');
      return;
    }


    if (Object.keys(modifiedRows).length > 0) {
      setSubmitError('Debes guardar los cambios antes de entregar');
      return;
    }

    setShowSubmitModal(false);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/v1/grd/${grdId}/submit-finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al entregar archivo');
      }


      alert('✅ Archivo entregado a Administración exitosamente');
      router.push('/dashboard');
    } catch (e: any) {
      setSubmitError(e.message || 'Error al entregar archivo');
      console.error('Error submitting to admin:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler para Admin: Aprobar archivo
   * Estado: pendiente_admin → aprobado
   * Después de aprobar, se queda en la página para poder descargar
   */
  const handleApprove = async () => {
    if (!grdId) {
      setApproveError('No hay archivo GRD seleccionado');
      return;
    }

    setIsApproving(true);
    setApproveError(null);

    try {
      const res = await fetch(`/api/v1/grd/${grdId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          reason: 'Aprobado por administrador',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al aprobar archivo');
      }

      alert('✅ Archivo aprobado exitosamente. Ahora puedes descargarlo.');
      
      // ✅ FASE 1: No redirigir, solo recargar la página para actualizar estado
      window.location.reload();
    } catch (e: any) {
      setApproveError(e.message || 'Error al aprobar archivo');
      console.error('Error approving file:', e);
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Handler para Admin: Rechazar archivo con razón
   * Estado: pendiente_admin → rechazado
   * Después de rechazar, se queda en la página
   * 
   * @param reason - Razón del rechazo proporcionada por el admin
   */
  const handleReject = async (reason: string) => {
    if (!grdId) {
      setApproveError('No hay archivo GRD seleccionado');
      return;
    }

    setIsRejecting(true);
    setApproveError(null);

    try {
      const res = await fetch(`/api/v1/grd/${grdId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          reason: reason,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al rechazar archivo');
      }


      setShowRejectModal(false);
      alert('✅ Archivo rechazado. El Encoder ha sido notificado.');
      
      // ✅ FASE 1: No redirigir, solo recargar la página para actualizar estado
      window.location.reload();
    } catch (e: any) {
      setApproveError(e.message || 'Error al rechazar archivo');
      console.error('Error rejecting file:', e);
    } finally {
      setIsRejecting(false);
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
    { headerName: "AT", field: "AT", sortable: true },
    { headerName: "AT Detalle", field: "AT_detalle", sortable: true },
    { headerName: "Monto AT", field: "monto_AT", sortable: true },
    { headerName: "Tipo Alta", field: "tipo_alta", sortable: true },
    { headerName: "IR-GRD", field: "IR-GRD", sortable: true },
    { headerName: "Peso", field: "peso", sortable: true },
    { headerName: "Monto RN", field: "monto_rn", sortable: true },
    { headerName: "Días Demora Rescate Hospital", field: "dias_demora_rescate_hospital", sortable: true },
    { headerName: "Pago Demora Rescate", field: "pago_demora_rescate", sortable: true },
    { headerName: "Pago Outlier Superior", field: "pago_outlier_superior", sortable: true },
    { headerName: "Documentación", field: "documentacion", sortable: true },
    { headerName: "Inlier/Outlier", field: "inlier/outlier", sortable: true },
    { headerName: "Grupo Dentro Norma", field: "grupo_dentro_norma", sortable: true },
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
    AT: 'boolean',
    AT_detalle: 'string',
    monto_AT: 'number',
    tipo_alta: 'string',
    ir_grd: 'int',
    peso: 'number',
    monto_rn: 'number',
    dias_demora_rescate_hospital: 'int',
    pago_demora_rescate: 'number',
    pago_outlier_superior: 'number',
    documentacion: 'string',
    inlier_outlier: 'string',
    grupo_dentro_norma: 'boolean',
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
      case 'string': {
        const rawText = raw;
        if (rawText === '') return { valid: true, parsed: '' };
        if (/^\d+$/.test(rawText)) {
        return { valid: false, parsed: null };
        }
        return { valid: true, parsed: rawText };
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

  const enrichColumns = (cols: any[], atOpts: string[], userRole?: string, workflowEstado?: string) => {
  return cols.map((c) => {
    const type = fieldTypes[c.field];
    

    const fieldEditable = isFieldEditable(c.field, userRole, workflowEstado);

    const base: any = {
      ...c,
      resizable: true,
      filter: true,
      editable: fieldEditable, 

      valueParser: (params: any) => params.newValue,
      valueSetter: (params: any) => {
  
        if (!fieldEditable) return false;

        const newVal = params.newValue;
        const { valid, parsed } = validateValue(type, newVal);

        if (valid) {
  const oldValue = params.data[c.field];
  params.data[c.field] = parsed;

  params.data._invalidFields = (params.data._invalidFields || []).filter((x: string) => x !== c.field);

  const changed = JSON.stringify(oldValue) !== JSON.stringify(parsed);
  if (params.data.episodio && changed) {
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

      params.data._invalidFields = [...(params.data._invalidFields || []), c.field];

      params.api.refreshCells({ rowNodes: [params.node], columns: [params.column], force: true });

      return false;

      },

    cellStyle: (params: any) => {
      const episodio = params.data?.episodio;
      if (!fieldEditable) {
      return {
        backgroundColor: "#f0f0f0",
        color: "#999",
        cursor: "not-allowed"
    };
  }

  if (params.data?._invalidFields?.includes(c.field)) {
    return {
      backgroundColor: "#ffe5e5",
      border: "1px solid #cc0000"
    };
  }

  const wasModified =
    episodio && modifiedRows[episodio] && modifiedRows[episodio][c.field] !== undefined;

  if (wasModified) {
    return { backgroundColor: "#fffbcc" };
  }

  return {};
}

    };
    if (!fieldEditable) {
      base.cellRenderer = LockCellRenderer;
    }

    if (c.field === "AT_detalle") {
  base.editable = (params: any) => {
  return fieldEditable && params.data?.AT === true;
};
  base.singleClickEdit = true;
  base.cellEditor = AtMultiSelectEditor;
  base.cellEditorPopup = true;
  base.cellEditorParams = { options: atOpts };

    base.cellRenderer = (params: any) => {
    if (params.data?.AT === false) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <span style={{ marginRight: 4 }}>🔒</span>
          <span style={{ backgroundColor: "#f0f0f0", 
            color: "#999",
            cursor: "not-allowed" }}>{params.value || ""}</span>
        </div>
      );
    }
    return params.value || "";
  };
  base.onCellClicked = (params: any) => {
  if (params.data?.AT === false) {
    params.api.stopEditing();
  }
};

  base.valueSetter = (params: any) => {
    const v = params.newValue;

    if (v && typeof v === "object") {
      params.data.AT_detalle = v.labels ?? "";
      params.data.monto_at   = v.monto  ?? 0;
    } else {

      params.data.AT_detalle = v ?? "";
    }

    if (params.data.episodio) {
      setModifiedRows(prev => ({
        ...prev,
        [params.data.episodio]: {
          ...(prev[params.data.episodio] || {}),
          ...params.data
        }
      }));
    }

    params.api.refreshCells({
      rowNodes: [params.node],
      columns: ["AT_detalle", "monto_AT"],
      force: true
    });

    return true; 
  };

  base.valueFormatter = (params: any) => params.value;
}



if (["AT", "validado", "documentacion"].includes(c.field)) {
  base.cellEditor = "agSelectCellEditor";
  base.cellEditorParams = {
    values: ["", ...YES_NO_OPTIONS]
  };
  base.singleClickEdit = true;

  base.valueParser = (params: any) => {
    const raw = String(params.newValue ?? "").toLowerCase();
    if (["sí", "si", "s", "yes", "true", "1"].includes(raw)) return true;
    if (["no", "n", "false", "0"].includes(raw)) return false;
    if (["", " ",].includes(raw)) return null;
  };

  base.valueFormatter = (params: any) => {
    if (params.value === true) return "Sí";
    if (params.value === false) return "No"; 
    if (params.value === null) return "";
    
  };

}

    return base;
  });
};


  useEffect(() => {
    setColumnDefs(enrichColumns(BASE_COLUMN_DEFS, [], role, estado));
  }, [role, estado]);
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
setColumnDefs(enrichColumns(BASE_COLUMN_DEFS, cleaned, role, estado));
    } catch (e) {
      console.error('Error loading AT options', e);
    }
  };

  fetchATOptions();
}, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(modifiedRows).length > 0) {
        e.preventDefault();
        e.returnValue = ''; 
        return ''; 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [modifiedRows]);

  useEffect(() => {
    if (!router) return;

    const handleRouteChange = (url: string) => {
      if (Object.keys(modifiedRows).length > 0) {
        const confirmLeave = window.confirm(
          '⚠️ Tienes cambios sin guardar que se perderán.\n\n¿Deseas continuar sin guardar?'
        );
        if (!confirmLeave) {
          router.push(window.location.pathname);
          throw 'Navegación cancelada por el usuario'; 
        }
      }
    };


    return () => {
    };
  }, [modifiedRows, router]);



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
  if (!grdId) return;

  try {
    setLoading(true);
    const res = await fetch(`/api/v1/grd/${grdId}/rows`);
    if (!res.ok) throw new Error(`Error al cargar GRD ${grdId}`);

    const data = await res.json();
    const rows = data.data || [];

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
            AT: row[headers.indexOf('AT')] || '',
            AT_detalle: row[headers.indexOf('AT Detalle')] || '',
            monto_AT: row[headers.indexOf('Monto AT')] || '',
            tipo_alta: row[headers.indexOf('Tipo Alta')] || '',
            ir_grd: row[headers.indexOf('IR-GRD')] || '',
            peso: row[headers.indexOf('Peso')] || '',
            monto_rn: row[headers.indexOf('Monto RN')] || '',
            dias_demora_rescate_hostpital: row[headers.indexOf('Días Demora Rescate Hospital')] || '',
            pago_demora_rescate: row[headers.indexOf('Pago Demora Rescate')] || '',
            pago_outlier_superior: row[headers.indexOf('Pago Outlier Superior')] || '',
            documentacion: row[headers.indexOf('Documentación')] || '',
            inlier_outlier: row[headers.indexOf('Inlier/Outlier')] || '',
            grupo_dentro_norma: row[headers.indexOf('Grupo Dentro Norma')] || '',
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
        `/api/v1/grd/${grdId}/rows?page=${page}&pageSize=${limit}`
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-4">📊 Editor </h1>
        
        <div className="flex items-center gap-2 text-sm">
          {Object.keys(modifiedRows).length > 0 && (
            <span className="text-orange-600 flex items-center gap-1 font-medium">
              ⚠️ Tienes {Object.keys(modifiedRows).length} cambio(s) sin guardar
            </span>
          )}
          
          {saveError && (
            <span className="text-red-600 flex items-center gap-1">
              ❌ {saveError}
            </span>
          )}
        </div>
      </div>

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

            {/* Botón Submit Encoder -> Finance */}
            {role === 'encoder' && (estado === 'borrador_encoder' || estado === 'rechazado') && Object.keys(modifiedRows).length === 0 && (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                } text-white px-4 py-2 rounded transition flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Entregando...
                  </>
                ) : (
                  <>
                    ✅ {estado === 'rechazado' ? 'Reenviar a Finanzas' : 'Entregar a Finanzas'}
                  </>
                )}
              </button>
            )}

            {/* Botón Submit Finance -> Admin */}
            {role === 'finance' && 
             (estado === 'pendiente_finance' || estado === 'borrador_finance') && 
             Object.keys(modifiedRows).length === 0 && (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                } text-white px-4 py-2 rounded transition flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Entregando...
                  </>
                ) : (
                  <>
                    📊 Entregar a Administración
                  </>
                )}
              </button>
            )}

            {/* Botón Admin: Aprobar */}
            {role === 'admin' && estado === 'pendiente_admin' && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className={`${
                  isApproving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                } text-white px-4 py-2 rounded transition flex items-center gap-2`}
              >
                {isApproving ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Aprobando...
                  </>
                ) : (
                  <>
                    ✅ Aprobar Archivo
                  </>
                )}
              </button>
            )}

            {/* Botón Admin: Estado Aprobado (bloqueado) */}
            {role === 'admin' && (estado === 'aprobado' || estado === 'exportado') && (
              <button
                disabled
                className="bg-green-400 text-white px-4 py-2 rounded cursor-not-allowed flex items-center gap-2"
              >
                ✅ Aprobado
              </button>
            )}

            {/* Botón Admin: Rechazar */}
            {role === 'admin' && estado === 'pendiente_admin' && (
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isRejecting}
                className={`${
                  isRejecting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                } text-white px-4 py-2 rounded transition flex items-center gap-2`}
              >
                {isRejecting ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Rechazando...
                  </>
                ) : (
                  <>
                    ❌ Rechazar Archivo
                  </>
                )}
              </button>
            )}

            {/* Botón Descargar: Solo visible cuando está aprobado o exportado */}
            {(estado === 'aprobado' || estado === 'exportado') && (
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                📥 Descargar Excel
              </button>
            )}
          </div>
          {saveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-300">
              ❌ {saveError}
            </div>
          )}
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-300">
              ❌ {submitError}
            </div>
          )}
          {approveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-300">
              ❌ {approveError}
            </div>
          )}
        </>
      )}

      {loading && <p className="text-gray-600">Cargando datos del GRD...</p>}
      {!loading && rowData.length === 0 && <p>No hay datos disponibles. Puedes cargar un archivo o esperar que se carguen los datos del GRD.</p>}
      
      {/* Modal de confirmación para Submit (Encoder o Finance) */}
      {showSubmitModal && grdId && (
        <SubmitConfirmModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onConfirm={role === 'finance' ? handleSubmitFinance : handleSubmitEncoder}
          role={role as 'encoder' | 'finance'}
          grdId={parseInt(grdId)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal de rechazo para Admin */}
      {showRejectModal && grdId && (
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          grdId={parseInt(grdId)}
          isSubmitting={isRejecting}
        />
      )}
    </div>
  );
}

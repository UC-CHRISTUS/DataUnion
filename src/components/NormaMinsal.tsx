"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);


const AgGridReact = dynamic<any>(

  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
) as any;

export default function NormaMinsalPage() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const headerMap: Record<string, string> = {
    GRD: "GRD",
    tipo_GRD: "Tipo GRD",
    peso_total: "Peso total",
    peso_total_depu: "Peso total (depu)",
    punto_corte_inferior: "Punto corte inferior",
    punto_corte_superior: "Punto corte superior",
    percentil_25: "Percentil 25",
    percentil_75: "Percentil 75",
    est_media: "Estancia media",
    total_altas: "Total altas",
    total_est: "Total estancias",
    altas_depu: "Altas (depu)",
    exitus: "Exitus",
    gravedad: "Gravedad",
    n_outliers_sup: "N outliers sup",
    tab_1430_d_est_med_depu_g: "Tab 1430 D EST MED DEPU G",
    tab_1430_d_num_out_inf_g: "Tab 1430 D NUM OUT INF G",
    tab_1430_d_perct_50_g: "Tab 1430 D PERCT 50 G",
    total_est_depu: "Total est depu",
  };

  useEffect(() => {
    const fetchNorma = async () => {
      try {
        const res = await fetch("/api/v1/norma-minsal");
        if (!res.ok) throw new Error("Error fetching norma");
        const data = await res.json();

        const rows = Array.isArray(data) ? data : data?.data ?? [];

        setRowData(rows || []);

        const keys =
          rows && rows.length > 0
            ? Object.keys(rows[0])
            : Object.keys(headerMap);

        const cols = keys
          .filter((k) => k !== "id") 
          .map((k) => ({
            headerName: headerMap[k] ?? k,
            field: k,
            sortable: true,
            resizable: true,
            editable: false,
      }));

        setColumnDefs(cols);
      } catch (e: any) {
        console.error("Failed to load norma:", e);
        setError(e.message || "Error al cargar los datos");
      } finally {
        setLoading(false); 
      }
    };

    fetchNorma();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4">
        📄 Norma Minsal v2019 (solo lectura)
      </h1>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-600">
          Error: {error}. Verifica que el endpoint <code>/api/v1/norma-minsal</code> esté disponible.
        </p>
      ) : rowData.length > 0 ? (
        <div className="ag-theme-alpine w-full" style={{ height: "600px" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              flex: 1,
              minWidth: 100,
              editable: false,
              resizable: true,
              sortable: true,
            }}
          />
        </div>
      ) : (
        <p>No se encontraron registros de norma.</p>
      )}
    </div>
  );
}

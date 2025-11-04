"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
// import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";

// Registrar módulos AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

// Import dinámico de AG Grid React
// TODO: Properly type this dynamic import instead of using 'as any'
// Cleaner fix: import { AgGridReact as AgGridReactType } from 'ag-grid-react' and use ComponentType<AgGridReactProps>
const AgGridReact = dynamic(
  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
) as any;

export default function NormaMinsalPage() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [filename, setFilename] = useState<string>("");

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

        // TODO: validate proper type for Excel cell values (currently any)
        const cols = jsonData[0].map((val: any, index: number) => ({
        headerName: val || `Col ${index + 1}`, // usa el valor de la celda, si está vacío, usa Col #
        field: `col_${index}`,
        editable: true,
        resizable: true,
        sortable: true,
        }));

        const rows = jsonData.slice(1).map((row: any[]) => {
          const obj: any = {};
          row.forEach((val, i) => {
            obj[`col_${i}`] = val;
          });
          return obj;
        });

        setColumnDefs(cols);
        setRowData(rows);
      };

      reader.readAsArrayBuffer(file);
    },
    []
  );

  const handleDownload = useCallback(() => {
    if (rowData.length === 0 || columnDefs.length === 0) return;

    const aoa = [
      columnDefs.map((col) => col.headerName),
      ...rowData.map((row) =>
        columnDefs.map((col) => row[col.field] ?? "")
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");

    XLSX.writeFile(wb, `editado_${filename || "archivo"}.xlsx`);
  }, [rowData, columnDefs, filename]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4">📄 Cargar Excel / Norma</h1>

      <input
        type="file"
        accept=".xlsx, .csv"
        onChange={handleFileUpload}
        className="border rounded p-2 mb-4"
      />

      {rowData.length > 0 && (
        <>
          <div className="ag-theme-alpine w-full" style={{ height: "600px" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                flex: 1,
                minWidth: 100,
                editable: true,
                resizable: true,
              }}
            />
          </div>
        </>
      )}

      {rowData.length === 0 && <p>Selecciona un archivo para cargar la tabla...</p>}
    </div>
  );
}

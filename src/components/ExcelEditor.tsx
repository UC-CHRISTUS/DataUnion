"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic(
  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
);

export default function ExcelEditorAGGrid() {
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

        const cols = jsonData[0].map((val, index) => ({ //sgy este error va a matar el deploy
          headerName: val || `Col ${index + 1}`,
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

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `editado_${filename || "archivo"}.xlsx`);
  }, [rowData, columnDefs, filename]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4">📊 Editor </h1>

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

          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-4"
          >
            💾 Descargar Excel
          </button>
        </>
      )}

      {rowData.length === 0 && <p>Selecciona un archivo para cargar la tabla...</p>}
    </div>
  );
}

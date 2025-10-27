
import React from "react";
import ExcelEditor from "@/components/ExcelEditor"; 

export default function VisualizatorPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4"></h1>
      <ExcelEditor />
    </div>
  );
}

/**
 * Página: /dashboard/archivos
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface ProcessedFile {
  id_grd_oficial: number;
  nombre_archivo: string;
  estado: 'aprobado';
  total_filas: number;
}

export default function ArchivosPage() {
  const router = useRouter();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/v1/admin/approved-files');
      
      if (!res.ok) {
        throw new Error('Error al cargar archivos');
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/grd/${id}/export`);
      
      if (!res.ok) {
        throw new Error('Error al descargar archivo');
      }

      // Crear blob y descargar
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GRD_${id}_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(`Error al descargar: ${e.message}`);
    }
  };

  const getEstadoBadge = (estado: string) => {
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        ✅ Aprobado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Cargando archivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📁 Archivos Aprobados</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded border border-red-300">
          ❌ {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            No hay archivos aprobados todavía
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {files.map((file) => (
            <div key={file.id_grd_oficial} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{file.nombre_archivo}</h3>
                {getEstadoBadge(file.estado)}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>ID GRD:</span>
                  <span className={styles.statValue}>{file.id_grd_oficial}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Episodios:</span>
                  <span className={styles.statValue}>{file.total_filas}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => handleDownload(file.id_grd_oficial)}
                  className={styles.btnDownload}
                >
                  📥 Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import styles from './FileUpload.module.css';

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    setMessage(null);
    setError(null);
    if (!selectedFile) {
      setError('No hay archivo seleccionado');
      return;
    }

    // only accept excel files
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('El archivo debe ser Excel (.xlsx o .xls)');
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);

      const res = await fetch('/api/v1/sigesa/upload', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        const errMsg = json?.error || json?.message || 'Error al subir el archivo';
        setError(String(errMsg));
      } else {
        setMessage('Archivo subido correctamente. Filas procesadas: ' + (json?.data?.rowCounts?.sigesaRows ?? 'n/a'));
        // clear selected file
        setSelectedFile(null);
        // optionally you could trigger a refresh elsewhere
      }
    } catch (e: any) {
      setError(e?.message || 'Error desconocido al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploadContainer}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.dropZoneContent}>
          <svg
            className={styles.uploadIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className={styles.dropZoneText}>
            Arrastra archivo hasta esta zona
          </p>
          <p className={styles.orText}>o</p>
          <button
            type="button"
            className={styles.chooseFileButton}
            onClick={handleButtonClick}
          >
            Elegir el archivo en mi ordenador
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.fileInput}
            onChange={handleFileInputChange}
          />
        </div>
      </div>
      
      {selectedFile && (
        <div className={styles.fileInfo}>
          <p className={styles.fileName}>
            Archivo seleccionado: {selectedFile.name}
          </p>
          <p className={styles.fileSize}>
            Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <div className={styles.actions} style={{ display: 'flex', visibility: 'visible', opacity: 1,  }}>
            <button
              type="button"
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Cargar'}
            </button>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
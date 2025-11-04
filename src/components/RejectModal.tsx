'use client';

import { useState } from 'react';
import styles from './SubmitConfirmModal.module.css'; // Reutilizamos estilos

/**
 * Props for RejectModal component
 */
interface RejectModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when admin confirms rejection with reason */
  onConfirm: (reason: string) => Promise<void>;
  /** GRD ID being rejected */
  grdId: number;
  /** Loading state during rejection */
  isSubmitting?: boolean;
}

/**
 * RejectModal Component
 * 
 * Modal for admin to reject a file with a reason
 * 
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 * 
 * const handleReject = async (reason: string) => {
 *   await fetch(`/api/v1/grd/${grdId}/review`, {
 *     method: 'POST',
 *     body: JSON.stringify({ action: 'reject', reason })
 *   });
 * };
 * 
 * <RejectModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={handleReject}
 *   grdId={123}
 * />
 * ```
 */
export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  grdId,
  isSubmitting = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle confirmation
   */
  const handleConfirm = async () => {
    // Validar que haya una razón
    if (!reason.trim()) {
      setError('Debes proporcionar una razón para el rechazo');
      return;
    }

    if (reason.trim().length < 10) {
      setError('La razón debe tener al menos 10 caracteres');
      return;
    }

    try {
      setError(null);
      await onConfirm(reason.trim());
      // Reset form
      setReason('');
      onClose();
    } catch (error) {
      setError('Error al rechazar archivo');
      console.error('Error in rejection:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={styles.title}>Rechazar Archivo</h2>
          <p className={styles.subtitle}>Proporciona una razón clara para el rechazo</p>
        </div>

        <div className={styles.content}>
          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Archivo GRD ID:</span>
              <span className={styles.infoValue}>#{grdId}</span>
            </div>
          </div>

          <div className={`${styles.warningBox}`} style={{ marginTop: '1rem' }}>
            <h3 className={styles.warningTitle}>⚠️ Importante:</h3>
            <ul className={styles.warningList}>
              <li>El archivo volverá al estado <strong>borrador_encoder</strong></li>
              <li>El Encoder recibirá una notificación con tu razón</li>
              <li>El Encoder podrá editar y enviar nuevamente</li>
              <li>Finance perderá acceso hasta que Encoder reenvíe</li>
            </ul>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label htmlFor="reject-reason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Razón del rechazo <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ejemplo: Faltan datos en campos AT_detalle de episodios 1234, 5678. Por favor completar antes de reenviar."
              disabled={isSubmitting}
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Mínimo 10 caracteres. Sé específico para que el Encoder pueda corregir.
            </p>
          </div>

          {error && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              color: '#991b1b',
              fontSize: '0.875rem'
            }}>
              ❌ {error}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleClose}
            className={`${styles.button} ${styles.buttonSecondary}`}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${styles.button} ${styles.buttonDanger}`}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <span className={styles.loadingWrapper}>
                <svg className={styles.spinner} viewBox="0 0 24 24">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rechazando...
              </span>
            ) : (
              '❌ Rechazar Archivo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

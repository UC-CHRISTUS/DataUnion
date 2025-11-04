'use client';

import { useState } from 'react';
import styles from './SubmitConfirmModal.module.css';

/**
 * Props for SubmitConfirmModal component
 */
interface SubmitConfirmModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when user confirms submission */
  onConfirm: () => Promise<void>;
  /** Role of the user (encoder or finance) */
  role: 'encoder' | 'finance';
  /** GRD ID being submitted */
  grdId: number;
  /** Loading state during submission */
  isSubmitting?: boolean;
}

/**
 * SubmitConfirmModal Component
 * 
 * Two-step confirmation modal for Encoder and Finance submission
 * Step 1: "¿Estás seguro de entregar?"
 * Step 2: "⚠️ No podrás editar hasta que finalice el proceso"
 * 
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 * 
 * const handleSubmit = async () => {
 *   await fetch(`/api/v1/grd/${grdId}/submit-encoder`, { method: 'POST' });
 *   router.push('/dashboard');
 * };
 * 
 * <SubmitConfirmModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={handleSubmit}
 *   role="encoder"
 *   grdId={123}
 * />
 * ```
 */
export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  role,
  grdId,
  isSubmitting = false,
}: SubmitConfirmModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  /**
   * Get role-specific text
   */
  const getRoleText = () => {
    if (role === 'encoder') {
      return {
        title: 'Entregar a Finanzas',
        subtitle: 'Enviarás este archivo al equipo de Finanzas para su revisión',
        recipient: 'Finanzas',
      };
    } else {
      return {
        title: 'Entregar a Administración',
        subtitle: 'Enviarás este archivo al equipo de Administración para su aprobación',
        recipient: 'Administración',
      };
    }
  };

  const roleText = getRoleText();

  /**
   * Handle going to step 2
   */
  const handleContinue = () => {
    setStep(2);
  };

  /**
   * Handle final confirmation
   */
  const handleFinalConfirm = async () => {
    try {
      await onConfirm();
      // Reset to step 1 for next time
      setStep(1);
      onClose();
    } catch (error) {
      // Error handling is done by parent component
      console.error('Error in submission:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setStep(1);
      onClose();
    }
  };

  /**
   * Handle back to step 1
   */
  const handleBack = () => {
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Step 1: Initial Confirmation */}
        {step === 1 && (
          <>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={styles.title}>{roleText.title}</h2>
              <p className={styles.subtitle}>{roleText.subtitle}</p>
            </div>

            <div className={styles.content}>
              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Archivo GRD ID:</span>
                  <span className={styles.infoValue}>#{grdId}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Destino:</span>
                  <span className={styles.infoValue}>{roleText.recipient}</span>
                </div>
              </div>

              <p className={styles.question}>¿Estás seguro de entregar este archivo?</p>
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
                onClick={handleContinue}
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={isSubmitting}
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* Step 2: Warning and Final Confirmation */}
        {step === 2 && (
          <>
            <div className={styles.header}>
              <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className={styles.title}>⚠️ Confirmación Final</h2>
              <p className={styles.subtitle}>Lee atentamente antes de continuar</p>
            </div>

            <div className={styles.content}>
              <div className={`${styles.warningBox}`}>
                <h3 className={styles.warningTitle}>Importante:</h3>
                <ul className={styles.warningList}>
                  <li>No podrás editar el archivo hasta que {roleText.recipient} lo revise</li>
                  <li>El archivo cambiará de estado automáticamente</li>
                  <li>Recibirás una notificación cuando sea procesado</li>
                  {role === 'encoder' && (
                    <li>El equipo de Finanzas podrá editar sus campos correspondientes</li>
                  )}
                  {role === 'finance' && (
                    <li>El administrador podrá aprobar, rechazar o solicitar cambios</li>
                  )}
                </ul>
              </div>

              <p className={styles.confirmQuestion}>
                ¿Confirmas que deseas entregar el archivo <strong>#{grdId}</strong>?
              </p>
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={handleBack}
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={isSubmitting}
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className={`${styles.button} ${styles.buttonDanger}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className={styles.loadingWrapper}>
                    <svg className={styles.spinner} viewBox="0 0 24 24">
                      <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entregando...
                  </span>
                ) : (
                  'Confirmar y Entregar'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

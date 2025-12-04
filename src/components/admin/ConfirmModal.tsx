'use client';

import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className={styles.title}>
          {title}
        </h3>

        {/* Message */}
        <p className={styles.message}>
          {message}
        </p>

        {/* Buttons */}
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${styles.confirmButton} ${
              isDestructive
                ? styles.confirmButtonDestructive
                : styles.confirmButtonNormal
            }`}
          >
            {isLoading ? (
              <span className={styles.loadingContent}>
                <svg
                  className={styles.spinner}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className={styles.spinnerCircle}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className={styles.spinnerPath}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


'use client';

import styles from './WorkflowAlert.module.css';

/**
 * Alert types with corresponding styles
 */
export type AlertType = 'info' | 'warning' | 'success' | 'error';

/**
 * Props for WorkflowAlert component
 */
interface WorkflowAlertProps {
  /** Message to display in the alert */
  message: string;
  /** Type of alert (determines color and icon) */
  type?: AlertType;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
}

/**
 * WorkflowAlert Component
 * 
 * Simple banner component for displaying workflow notifications
 * Used in dashboard to notify Finance/Admin of pending files
 * 
 * @example
 * ```tsx
 * <WorkflowAlert 
 *   message="🔔 Tienes un archivo pendiente de revisión" 
 *   type="info"
 *   action={{
 *     label: "Ver archivo",
 *     onClick: () => router.push('/visualizator')
 *   }}
 * />
 * ```
 */
export default function WorkflowAlert({
  message,
  type = 'info',
  action,
  dismissible = false,
  onDismiss,
}: WorkflowAlertProps) {
  
  /**
   * Get icon based on alert type
   */
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          {getIcon()}
        </div>
        
        <div className={styles.messageWrapper}>
          <p className={styles.message}>{message}</p>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className={styles.actionButton}
            type="button"
          >
            {action.label}
          </button>
        )}

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={styles.dismissButton}
            type="button"
            aria-label="Cerrar alerta"
          >
            <svg className={styles.dismissIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

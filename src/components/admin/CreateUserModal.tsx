'use client';

import { useState, FormEvent } from 'react';
import { getRoleOptions, type UserRole } from '@/lib/constants/roles';
import styles from './CreateUserModal.module.css';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'encoder' as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      // Show temporary password to admin
      setTemporaryPassword(data.temporaryPassword);
      setShowSuccess(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    alert('Contraseña copiada al portapapeles');
  };

  const handleClose = () => {
    if (showSuccess) {
      onSuccess();
    }
    // Reset form
    setFormData({ email: '', fullName: '', role: 'encoder' });
    setTemporaryPassword('');
    setShowSuccess(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

return (
  <div className={styles.overlay}>
    {/* Backdrop */}
    <div className={styles.backdrop} onClick={handleClose} />

    {/* Modal */}
    <div className={styles.modal}>

      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {showSuccess ? '✅ Usuario Creado' : '➕ Crear Usuario'}
        </h2>

        <button
          onClick={handleClose}
          className={styles.closeButton}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className={styles.body}>
        
        {/* SUCCESS STATE - Mostrar contraseña temporal */}
        {showSuccess ? (
          <>
            <div className={styles.successBox}>
              <p className={styles.successText}>
                El usuario ha sido creado exitosamente con contraseña temporal.
              </p>
            </div>

            <div className={styles.passwordSection}>
              <label className={styles.passwordLabel}>
                Contraseña Temporal
              </label>
              <div className={styles.passwordInputGroup}>
                <input
                  type="text"
                  value={temporaryPassword}
                  readOnly
                  className={styles.passwordInput}
                />
                <button
                  onClick={handleCopyPassword}
                  className={styles.copyButton}
                >
                  📋 Copiar
                </button>
              </div>
              <p className={styles.passwordWarning}>
                ⚠️ Comparta esta contraseña con el usuario. Deberá cambiarla al primer inicio de sesión.
              </p>
            </div>
          </>
        ) : (
          // FORM STATE - Mostrar formulario de creación
          <>
            {/* Error */}
            {error && (
              <div className={styles.errorBox}>
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez"
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@uc.cl"
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            {/* Rol */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                required
                disabled={isLoading}
                className={styles.select}
              >
                {getRoleOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        {showSuccess ? (
          <button
            onClick={handleClose}
            className={styles.doneButton}
          >
            Listo
          </button>
        ) : (
          <>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancelar
            </button>

            <button
              onClick={() => handleSubmit()}
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? "Creando..." : "Crear"}
            </button>
          </>
        )}
      </div>

    </div>
  </div>
);

}


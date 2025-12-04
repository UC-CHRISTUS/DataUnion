'use client';

import { useState, FormEvent, useEffect } from 'react';
import { getRoleOptions, type UserRole } from '@/lib/constants/roles';
import styles from './EditUserModal.module.css';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'encoder' as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!user) {
      setError('No se ha seleccionado ningún usuario');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      // Success - notify parent and close
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ fullName: '', role: 'encoder' });
    setError('');
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
  <div className={styles.overlay}>
    {/* Backdrop */}
    <div className={styles.backdrop} onClick={handleClose} />

    {/* Modal Panel */}
    <div className={styles.modal}>

      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          ✏️ Editar Usuario
        </h2>
        <p className={styles.subtitle}>
          Actualice la información del usuario
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Correo Electrónico</label>
          <input
            type="email"
            value={user.email}
            disabled
            className={styles.input}
          />
          <p className={styles.helperText}>No se puede modificar</p>
        </div>

        {/* Full Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Nombre Completo</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={isLoading}
            placeholder="Juan Pérez"
            className={styles.input}
          />
        </div>

        {/* Role */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Rol</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
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

        {/* Buttons */}
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}


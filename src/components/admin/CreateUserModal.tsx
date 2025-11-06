'use client';

import { useState, FormEvent } from 'react';
import { getRoleOptions, type UserRole } from '@/lib/constants/roles';

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

    {/* Modal */}
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 animate-[fadeIn_.25s_ease-out]">

      {!showSuccess ? (
        <>
          {/* Header */}
          <div className="mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              ➕ Crear Usuario
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete los datos del nuevo usuario
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nombre */}
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez"
                required
                disabled={isLoading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@uc.cl"
                required
                disabled={isLoading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                required
                disabled={isLoading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                {getRoleOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-sm"
              >
                {isLoading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* Éxito */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Usuario Creado</h3>
            <p className="text-sm text-gray-600">Se ha generado una contraseña temporal.</p>
          </div>

          {/* Contraseña Temporal */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900 mb-2">Contraseña Temporal:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-white border border-amber-200 rounded text-lg font-mono text-amber-900">
                {temporaryPassword}
              </code>
              <button
                onClick={handleCopyPassword}
                className="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              El usuario deberá cambiarla en su primer inicio de sesión.
            </p>
          </div>

          {/* Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Datos Registrados:</h4>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Nombre:</dt><dd className="font-medium">{formData.fullName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Email:</dt><dd className="font-medium">{formData.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Rol:</dt>
                <dd className="font-medium">
                  {getRoleOptions().find(r => r.value === formData.role)?.label}
                </dd>
              </div>
            </dl>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
          >
            Cerrar
          </button>
        </>
      )}
    </div>
  </div>
);

}


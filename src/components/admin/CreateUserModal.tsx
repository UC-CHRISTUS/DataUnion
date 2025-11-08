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
  <div className="fixed inset-0 z-50 px-6 py-7 flex items-center justify-center p-6">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

    {/* Modal */}
    <div className="relative bg-white rounded-3xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">

      {/* HEADER */}
    <div className="flex items-center gap-4 px-6 py-5 border-b">

      <h2 className="text-lg font-semibold text-gray-800 flex-1">
        ➕ Crear Usuario
      </h2>

      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        ✕
      </button>
    </div>

      {/* BODY */}
      <div className="px-6 py-7 space-y-6">
        
        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Nombre Completo
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Juan Pérez"
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 transition"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="usuario@uc.cl"
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 transition"
          />
        </div>

        {/* Rol */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Rol
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 transition"
          >
            {getRoleOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 px-6 py-5 border-t bg-gray-50">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit as any}
          disabled={isLoading}
          className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-green-700 transition disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear"}
        </button>
      </div>

    </div>
  </div>
);



}


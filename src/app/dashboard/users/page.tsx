'use client';

import { useState, useEffect } from 'react';
import CreateUserModal from '@/components/admin/CreateUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { ROLE_LABELS } from '@/lib/constants/roles';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'encoder' | 'finance';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  last_login: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuarios');
      }

      // Get current user ID to filter them out
      const allUsers = data.users || [];
      
      // If we don't have currentUserId yet, get it from session
      if (!currentUserId && allUsers.length > 0) {
        // Get current user from session API
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (sessionResponse.ok && sessionData.user) {
          setCurrentUserId(sessionData.user.id);
          // Filter out current user from the list
          setUsers(allUsers.filter((user: User) => user.id !== sessionData.user.id));
        } else {
          setUsers(allUsers);
        }
      } else {
        // Filter out current user if we already have their ID
        setUsers(allUsers.filter((user: User) => user.id !== currentUserId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalSuccess = () => {
    fetchUsers(); // Reload users after creating new one
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchUsers(); // Reload users after editing
  };

  const handleToggleStatusClick = (user: User) => {
    setUserToToggle({
      id: user.id,
      name: user.full_name,
      currentStatus: user.is_active,
    });
    setIsConfirmModalOpen(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!userToToggle) return;

    setIsTogglingStatus(true);

    try {
      const response = await fetch(`/api/admin/users/${userToToggle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !userToToggle.currentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar estado del usuario');
      }

      // Success - reload users
      await fetchUsers();
      setIsConfirmModalOpen(false);
      setUserToToggle(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del usuario');
      setIsConfirmModalOpen(false);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete({
      id: user.id,
      name: user.full_name,
    });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      // Success - reload users
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
  <div className="min-h-screen bg-white py-10 px-4 flex justify-center">


    <div className="w-full max-w-6xl">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-600 mt-1">Administre los usuarios y sus permisos</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-all"
        >
          <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 border-4 border-purple-300 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Usuario</th>
                  <th className="px-6 py-3 text-left">Rol</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Último Login</th>
                  <th className="px-6 py-3 text-left">Creado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-500">
                      <p className="mb-3 text-sm">No hay usuarios aún</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Crear el primero →
                      </button>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700 font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'encoder'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>

                      <td className="px-6 py-4 space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex ${
                          user.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {user.must_change_password && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium inline-flex bg-amber-100 text-amber-700">
                            🔒 Contraseña temporal
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{formatDate(user.last_login)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(user.created_at)}</td>

                      <td className="px-6 py-4 text-right flex gap-3 justify-end">
                        <button onClick={() => handleEdit(user)} className="text-purple-600 hover:text-purple-800">
                          ✏️
                        </button>

                        <button onClick={() => handleToggleStatusClick(user)} className="hover:opacity-75">
                          {user.is_active ? '🚫' : '✅'}
                        </button>

                        <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-800">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && users.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Total Usuarios", users.length, "text-gray-900"],
            ["Administradores", users.filter(u => u.role === 'admin').length, "text-purple-600"],
            ["Codificadores", users.filter(u => u.role === 'encoder').length, "text-blue-600"],
            ["Finanzas", users.filter(u => u.role === 'finance').length, "text-green-600"],
          ].map(([label, value, color], i) => (
            <div key={i} className="bg-white p-5 rounded-xl border shadow-sm">
              <p className="text-sm text-gray-600">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Modales */}
    <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} />
    <EditUserModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingUser(null); }} onSuccess={handleEditSuccess} user={editingUser} />
    <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => { setIsConfirmModalOpen(false); setUserToToggle(null); }} onConfirm={handleToggleStatusConfirm} title={userToToggle?.currentStatus ? 'Desactivar Usuario' : 'Activar Usuario'} message={userToToggle?.currentStatus ? `¿Está seguro de desactivar a ${userToToggle.name}?` : `¿Está seguro de activar a ${userToToggle?.name}?`} confirmText={userToToggle?.currentStatus ? 'Desactivar' : 'Activar'} cancelText="Cancelar" isDestructive={userToToggle?.currentStatus} isLoading={isTogglingStatus} />
    <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }} onConfirm={handleDeleteConfirm} title="Eliminar Usuario" message={`¿Eliminar permanentemente a ${userToDelete?.name}?`} confirmText="Eliminar Permanentemente" cancelText="Cancelar" isDestructive isLoading={isDeletingUser} />
  </div>
);

}


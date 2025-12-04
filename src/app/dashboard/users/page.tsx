'use client';

import { useState, useEffect } from 'react';
import CreateUserModal from '@/components/admin/CreateUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { ROLE_LABELS } from '@/lib/constants/roles';
import styles from './page.module.css';

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
  <div className={styles.container}>
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>Gestión de Usuarios</h1>
          <p>Administre los usuarios y sus permisos</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.createButton}
        >
          <svg className={styles.createButtonIcon} stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Login</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className={styles.tableBody}>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      <p>No hay usuarios aún</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className={styles.emptyStateButton}
                      >
                        Crear el primero →
                      </button>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>
                            <span className={styles.userAvatarText}>
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className={styles.userName}>{user.full_name}</p>
                            <p className={styles.userEmail}>{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`${styles.roleBadge} ${
                          user.role === 'admin'
                            ? styles.roleBadgeAdmin
                            : user.role === 'encoder'
                            ? styles.roleBadgeEncoder
                            : styles.roleBadgeFinance
                        }`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>

                      <td>
                        <div className={styles.statusCell}>
                          <span className={`${styles.statusBadge} ${
                            user.is_active
                              ? styles.statusBadgeActive
                              : styles.statusBadgeInactive
                          }`}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          {user.must_change_password && (
                            <span className={`${styles.statusBadge} ${styles.statusBadgePassword}`}>
                              🔒 Contraseña temporal
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={styles.dateText}>{formatDate(user.last_login)}</td>
                      <td className={styles.dateText}>{formatDate(user.created_at)}</td>

                      <td>
                        <div className={styles.actionsCell}>
                          <button 
                            onClick={() => handleEdit(user)} 
                            className={`${styles.actionButton} ${styles.actionButtonEdit}`}
                          >
                            ✏️
                          </button>

                          <button 
                            onClick={() => handleToggleStatusClick(user)} 
                            className={styles.actionButton}
                          >
                            {user.is_active ? '🚫' : '✅'}
                          </button>

                          <button 
                            onClick={() => handleDeleteClick(user)} 
                            className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                          >
                            🗑️
                          </button>
                        </div>
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
        <div className={styles.statsGrid}>
          {[
            ["Total Usuarios", users.length, styles.statValueGray],
            ["Administradores", users.filter(u => u.role === 'admin').length, styles.statValuePurple],
            ["Codificadores", users.filter(u => u.role === 'encoder').length, styles.statValueBlue],
            ["Finanzas", users.filter(u => u.role === 'finance').length, styles.statValueGreen],
          ].map(([label, value, colorClass], i) => (
            <div key={i} className={styles.statCard}>
              <p className={styles.statLabel}>{label}</p>
              <p className={`${styles.statValue} ${colorClass}`}>{value}</p>
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


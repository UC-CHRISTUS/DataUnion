'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';


interface SidebarProps {
  isOpen: boolean;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'encoder' | 'finance';
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/'); 
  router.refresh();
};


  // Fetch current user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          console.log('User data:', data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Get menu items based on user role
   * Encoder: Dashboard, Upload, SIGESA, Norma, Editor
   * Finance: Dashboard, SIGESA, Editor
   * Admin: Dashboard, Users, SIGESA, Editor
   */
  const getMenuItemsByRole = (role: 'admin' | 'encoder' | 'finance') => {
    const allMenuItems = [
        {
          href: '/inicio',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
         ),
          label: 'Inicio',
          roles: ['admin', 'encoder', 'finance'] // All roles
       },
      {
        href: '/dashboard/users',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        label: 'Usuarios',
        roles: ['admin'] // Only admin
      },
      {
        href: '/dashboard/archivos',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        ),
        label: 'Archivos',
        roles: ['admin'] // Only admin - FASE 2
      },
      {
        href: '/upload',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        ),
        label: 'Subir Archivos',
        roles: ['encoder'] // Only encoder
      },
      {
        href: '/sigesa',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width={24}
            height={24}
            fill="#217346"
          >
            <path d="M6 4h36v40H6z" />
            <path
              fill="white"
              d="M12 12h24v24H12z"
            />
            <text x="24" y="30" textAnchor="middle" fontSize="16" fill="#217346" fontFamily="Arial">D</text>
          </svg>
        ),
        label: 'Sigesa',
        roles: ['admin', 'encoder', 'finance'] // All roles
      },
      {
        href: '/norma',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width={24}
            height={24}
          >
            <rect x="6" y="4" width="36" height="40" rx="3" fill="#f5f5f5" stroke="#217346" strokeWidth="2" />
            <rect x="12" y="12" width="24" height="3" fill="#217346" />
            <rect x="12" y="18" width="24" height="3" fill="#217346" />
            <rect x="12" y="24" width="24" height="3" fill="#217346" />
            <polyline points="14,32 20,38 34,24" fill="none" stroke="#217346" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        label: 'Norma',
        roles: ['encoder'] // Only encoder
      },
      {
        href: '/visualizator',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width={24}
            height={24}
            fill="#217346"
          >
            <path d="M6 4h36v40H6z" />
            <path
              fill="white"
              d="M12 12h24v24H12z"
            />
            <text x="24" y="30" textAnchor="middle" fontSize="16" fill="#217346" fontFamily="Arial">X</text>
          </svg>
        ),
        label: 'Editor',
        roles: ['admin', 'encoder', 'finance'] // All roles
      },
    ];

    // Filter menu items by role
    return allMenuItems.filter(item => item.roles.includes(role));
  };

  const menuItems = user ? getMenuItemsByRole(user.role) : [];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className={styles.logoText}>DataUnion</span>
        </div>
      </div>
      
      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.href} className={styles.navItem}>
              <Link 
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

<div className={styles.sidebarFooter}>
  <div className={styles.userProfile}>
    <div className={styles.userAvatar}>
      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
    </div>

    <div className={styles.userInfo}>
      <span className={styles.userName}>{user?.fullName || "Usuario"}</span>
      <span className={styles.userRole}>
        {user?.role === "admin" && "Administrador"}
        {user?.role === "encoder" && "Codificador"}
        {user?.role === "finance" && "Finanzas"}
      </span>
    </div>
  </div>

  <button onClick={handleSignOut} className={styles.logoutButton}>
    Cerrar sesión
  </button>
</div>



    </aside>
  );
}
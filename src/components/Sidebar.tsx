'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/dashboard',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard'
    },
    {
      href: '/upload',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      label: 'Subir Archivos'
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
      label: 'Sigesa'
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
      label: 'Editor'
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
      label: 'Norma'
    },

    
  ];

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
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Usuario</span>
            <span className={styles.userEmail}>usuario@dataunion.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
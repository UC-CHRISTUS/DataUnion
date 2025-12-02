'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Public routes that should not show Sidebar/TopNav
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If it's a public route (login/signup), render children without Layout components
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes get full Layout with Sidebar and TopNav
  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`${styles.mainContent} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
        <TopNav onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
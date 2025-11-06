'use client';

import { useState } from 'react';
import SignOut from './auth/SignOut'; 
import styles from './TopNav.module.css';

interface TopNavProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function TopNav({ onToggleSidebar, isSidebarOpen }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.topNav}>
      {/* LEFT: Burger Button */}
      <div className={styles.navLeft}>
        <button 
          className={styles.menuButton}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* RIGHT: User Menu */}
      <div className={styles.navRight}>
        <div className={styles.navActions}>
          <div className={styles.userMenu}>
            {/* <button 
              className={styles.userAvatar}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </button> */}

            {/* ✅ Dropdown Menú */}
            {/* {menuOpen && (
              <div className={styles.dropdownMenu}>
                <SignOut />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}

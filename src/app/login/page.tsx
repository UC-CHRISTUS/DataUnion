import { Suspense } from 'react';
import SignIn from '@/components/auth/SignIn';
import styles from './loading.module.css';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Cargando...</p>
        </div>
      </div>
    }>
      <SignIn />
    </Suspense>
  );
}


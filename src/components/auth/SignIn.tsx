'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import styles from './SignIn.module.css';

interface SignInProps {
  onSignUp?: () => void;
}

export default function SignIn({ onSignUp }: SignInProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'no-session') {
      setError('Debe iniciar sesión primero para cambiar su contraseña');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message || 'Credenciales inválidas');
    if (!authData.user) throw new Error('Usuario no encontrado');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (userError || !userData) throw new Error('Error al cargar datos del usuario');

    if (!userData.is_active) {
      await supabase.auth.signOut();
      throw new Error('Usuario inactivo. Contacta al administrador.');
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    // ✅ IMPORTANTE: NO hacemos setIsLoading(false) aquí.
    // Dejamos el botón bloqueado hasta terminar la navegación.

    if (userData.must_change_password) {
      router.replace('/change-password');
    } else {
      router.replace('/dashboard/users');
    }

  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';

    if (/invalid login credentials/i.test(rawMessage)) {
      setError('Credenciales no válidas. Revisa tu correo y contraseña.');
    } else {
      setError(rawMessage);
    }

    // ✅ SI hubo error → ahora sí reactivamos el botón:
    setIsLoading(false);
  }
};


return (
  <div className={styles.container}>
    {/* Panel izquierdo con banner */}
    <div className={styles.leftPanel}>
      <div className={styles.bannerImage} />
      
      <div className={styles.carouselDots}>
        <span className={styles.dot}></span>
        <span className={`${styles.dot} ${styles.dotInactive}`}></span>
        <span className={`${styles.dot} ${styles.dotInactive}`}></span>
      </div>
    </div>

    {/* Panel derecho con formulario */}
    <div className={styles.rightPanel}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>UC Christus</h1>
          <p className={styles.subtitle}>Sistema de Gestión y Codificación</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Correo</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Contraseña</label>
            
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.passwordInput}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className={styles.toggleButton}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  </div>
);



}


'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import styles from './page.module.css';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [validationErrors, setValidationErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // No session - redirect to login with a message
        router.push('/login?error=no-session');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const validatePassword = (password: string) => {
    setValidationErrors({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, newPassword: password });
    validatePassword(password);
  };

  const isPasswordValid = () => {
    return Object.values(validationErrors).every(Boolean);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validate password requirements
    if (!isPasswordValid()) {
      setError('La contraseña no cumple con todos los requisitos de seguridad');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Decorative background elements */}
      <div className={styles.decorTop} />
      <div className={styles.decorBottom} />

      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className={styles.title}>
              Cambio de Contraseña Obligatorio
            </h1>
            <p className={styles.subtitle}>
              Por seguridad, debe cambiar su contraseña temporal antes de continuar
            </p>
          </div>

          {/* Warning message */}
          <div className={styles.warningBox}>
            <div className={styles.warningContent}>
              <svg className={styles.warningIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className={styles.warningText}>
                Esta es su primera vez iniciando sesión. Por favor, cambie su contraseña temporal por una segura.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* New Password */}
            <div className={styles.fieldWrapper}>
              <label htmlFor="newPassword" className={styles.label}>
                Nueva Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.toggleButton}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.fieldWrapper}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={styles.input}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Requirements */}
            <div className={styles.requirementsBox}>
              <p className={styles.requirementsTitle}>
                La contraseña debe cumplir:
              </p>
              <ul className={styles.requirementsList}>
                <li className={styles.requirementItem}>
                  <span className={`${styles.requirementIcon} ${validationErrors.length ? styles.requirementIconValid : styles.requirementIconInvalid}`}>
                    {validationErrors.length ? '✓' : '○'}
                  </span>
                  <span className={validationErrors.length ? styles.requirementTextValid : styles.requirementTextInvalid}>
                    Mínimo 8 caracteres
                  </span>
                </li>
                <li className={styles.requirementItem}>
                  <span className={`${styles.requirementIcon} ${validationErrors.uppercase ? styles.requirementIconValid : styles.requirementIconInvalid}`}>
                    {validationErrors.uppercase ? '✓' : '○'}
                  </span>
                  <span className={validationErrors.uppercase ? styles.requirementTextValid : styles.requirementTextInvalid}>
                    Al menos una mayúscula (A-Z)
                  </span>
                </li>
                <li className={styles.requirementItem}>
                  <span className={`${styles.requirementIcon} ${validationErrors.lowercase ? styles.requirementIconValid : styles.requirementIconInvalid}`}>
                    {validationErrors.lowercase ? '✓' : '○'}
                  </span>
                  <span className={validationErrors.lowercase ? styles.requirementTextValid : styles.requirementTextInvalid}>
                    Al menos una minúscula (a-z)
                  </span>
                </li>
                <li className={styles.requirementItem}>
                  <span className={`${styles.requirementIcon} ${validationErrors.number ? styles.requirementIconValid : styles.requirementIconInvalid}`}>
                    {validationErrors.number ? '✓' : '○'}
                  </span>
                  <span className={validationErrors.number ? styles.requirementTextValid : styles.requirementTextInvalid}>
                    Al menos un número (0-9)
                  </span>
                </li>
                <li className={styles.requirementItem}>
                  <span className={`${styles.requirementIcon} ${validationErrors.special ? styles.requirementIconValid : styles.requirementIconInvalid}`}>
                    {validationErrors.special ? '✓' : '○'}
                  </span>
                  <span className={validationErrors.special ? styles.requirementTextValid : styles.requirementTextInvalid}>
                    Al menos un carácter especial (!@#$%^&*)
                  </span>
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid()}
              className={styles.submitButton}
            >
              {isLoading ? (
                <span className={styles.submitButtonContent}>
                  <svg
                    className={styles.submitSpinner}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className={styles.submitSpinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className={styles.submitSpinnerPath}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Cambiando contraseña...
                </span>
              ) : (
                'Cambiar Contraseña y Continuar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


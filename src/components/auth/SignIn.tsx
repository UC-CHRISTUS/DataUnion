'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

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
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Credenciales inválidas');
      }

      if (!authData.user) {
        throw new Error('Usuario no encontrado');
      }

      // Get user data from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Error al cargar datos del usuario');
      }

      // Check if user is active
      if (!userData.is_active) {
        await supabase.auth.signOut();
        throw new Error('Usuario inactivo. Contacta al administrador.');
      }

      // Update last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // Check if user must change password
      if (userData.must_change_password) {
        router.push('/change-password');
      } else {
        // Redirect to dashboard on success
        router.push('/dashboard/users');
      }
      router.refresh();
    } catch (err) {
  const rawMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';

  if (/invalid login credentials/i.test(rawMessage)) {
    setError('Credenciales no válidas. Revisa tu correo y contraseña.');
  } else {
    setError(rawMessage);
  }
} finally {
  setIsLoading(false);
}

  };

return (
  <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">

    <div 
      className="hidden md:flex flex-col justify-center px-10 text-white relative"
      style={{ backgroundColor: "#a770b2" }} 
    >
      <div
      className="absolute inset-0 bg-cover bg-bottom opacity-80"
      style={{ 
        backgroundImage: "url('/banner.png')",
        backgroundPosition: "22% center" 
      }}
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        <span className="w-2 h-2 rounded-full bg-white/70"></span>
        <span className="w-2 h-2 rounded-full bg-white/40"></span>
        <span className="w-2 h-2 rounded-full bg-white/40"></span>
      </div>
    </div>

    <div className="flex items-center justify-center px-10 py-12 bg-white">
      <div className="w-full max-w-sm">

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">UC Christus</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Gestión y Codificación</p>
        </div>

        {error && (
          <div className="mb-5 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">

          <div>
            <div className="flex flex-col gap-1"> 
            <label className="text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      <div className="flex flex-col gap-1"> 
      <label className="text-sm font-medium text-gray-700 mb-3 block">Contraseña</label>

      <div className="relative mt-3">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
        >
          {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          )}
          </button>
        </div>
        <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-white hover:text-white font-medium"
        >
          ¿Olvidaste tu contraseña?
        </button> 
        </div>
       </div> 

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            {isLoading ? "Entrando..." : "Iniciar sesión"}
          </button>

        </form>

      </div>
    </div>

  </div>
);



}


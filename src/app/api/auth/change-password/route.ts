import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/auth/change-password
 * Change user password (authenticated users only)
 * Validates password strength and updates must_change_password flag
 */
export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();
    
    // Create Supabase client with cookie handling
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Cookie setting may fail
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Cookie removal may fail
            }
          },
        },
      }
    );
    
    // Get current authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'No autenticado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }
    
    // Get user data from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }
    
    // Validate password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        { 
          error: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
        },
        { status: 400 }
      );
    }
    
    // Use admin client to update password (bypasses RLS)
    const supabaseAdmin = getSupabaseAdmin();
    
    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Error al actualizar contraseña' },
        { status: 400 }
      );
    }
    
    // Update must_change_password flag in public.users
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ 
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.id);
    
    if (userUpdateError) {
      console.error('Error updating user must_change_password flag:', userUpdateError);
      // Password was changed but flag update failed - log warning
      console.warn('Password changed successfully but must_change_password flag not updated for user:', userData.id);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in POST /api/auth/change-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-helpers';

/**
 * POST /api/auth/change-password
 * Change user password (authenticated users only)
 * Validates password strength and updates must_change_password flag
 */
export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();
    
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado. Por favor inicie sesión.' },
        { status: 401 }
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
    
    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Error al actualizar contraseña' },
        { status: 400 }
      );
    }
    
    // Update must_change_password flag in public.users
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ 
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    if (userUpdateError) {
      console.error('Error updating user must_change_password flag:', userUpdateError);
      // Password was changed but flag update failed - log warning
      console.warn('Password changed successfully but must_change_password flag not updated for user:', user.id);
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


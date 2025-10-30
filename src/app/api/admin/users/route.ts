import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helpers';
import { USER_ROLES } from '@/lib/constants/roles';
import crypto from 'crypto';

/**
 * Generate a secure random password
 * @param length - Password length (default 12)
 * @returns Secure random password
 */
function generateSecurePassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  
  // Ensure at least one of each type
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  // If not all requirements met, try again (recursive)
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return generateSecurePassword(length);
  }
  
  return password;
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 * Generates a temporary password and returns it to admin
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();
    
    const { email, fullName, role } = await request.json();
    
    // Validación básica
    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, nombre completo y rol son requeridos' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = Object.values(USER_ROLES);
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido. Valores permitidos: admin, encoder, finance' },
        { status: 400 }
      );
    }
    
    // Generate temporary password
    const temporaryPassword = generateSecurePassword(12);
    
    // Get admin client with Service Role Key
    const supabaseAdmin = getSupabaseAdmin();
    
    // Create user in Supabase Auth using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    });
    
    if (authError) {
      console.error('Error creating user in auth:', authError);
      
      // Handle specific errors
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message || 'Error al crear usuario' },
        { status: 400 }
      );
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }
    
    // Verify user was created in public.users table (via trigger)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();
    
    if (userError) {
      console.error('Error verifying user in public.users:', userError);
      // User created in auth but not in public table - this shouldn't happen due to trigger
      console.warn('User created in auth.users but not in public.users:', authData.user.id);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: userData?.id,
        email,
        fullName,
        role,
      },
      temporaryPassword, // Admin will see this and send it manually to the user
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'No autorizado. Se requiere rol de administrador.' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();
    
    // Get admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get all users from public.users
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return NextResponse.json({ 
      success: true,
      users: users || [] 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'No autorizado. Se requiere rol de administrador.' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


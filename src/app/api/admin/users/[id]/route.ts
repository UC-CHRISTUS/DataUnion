import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helpers';
import { USER_ROLES } from '@/lib/constants/roles';

/**
 * PUT /api/admin/users/[id]
 * Edit user (admin only)
 * Updates full_name and role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();
    
    const { id } = params;
    const { fullName, role } = await request.json();
    
    // Validación básica
    if (!fullName || !role) {
      return NextResponse.json(
        { error: 'Nombre completo y rol son requeridos' },
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
    
    // Get admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Update user in public.users
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Error al actualizar usuario' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      user: updatedUser,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]:', error);
    
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
 * PATCH /api/admin/users/[id]
 * Activate/Deactivate user (admin only)
 * Updates is_active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();
    
    const { id } = params;
    const { is_active } = await request.json();
    
    // Validación básica
    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo is_active debe ser un boolean' },
        { status: 400 }
      );
    }
    
    // Get admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Security check: Don't allow deactivating the last active admin
    if (existingUser.role === 'admin' && existingUser.is_active && !is_active) {
      // Count active admins
      const { data: activeAdmins, error: countError } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'admin')
        .eq('is_active', true);
      
      if (countError) {
        console.error('Error counting active admins:', countError);
        return NextResponse.json(
          { error: 'Error al verificar administradores activos' },
          { status: 500 }
        );
      }
      
      // If this is the last active admin, don't allow deactivation
      if (activeAdmins && activeAdmins.length <= 1) {
        return NextResponse.json(
          { error: 'No puede desactivar al único administrador activo del sistema' },
          { status: 400 }
        );
      }
    }
    
    // Update user status
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user status:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Error al actualizar estado del usuario' },
        { status: 400 }
      );
    }
    
    // TODO: Consider invalidating user's session if deactivating
    // This would require additional logic to sign out the user
    
    return NextResponse.json({
      success: true,
      message: is_active 
        ? 'Usuario activado correctamente' 
        : 'Usuario desactivado correctamente',
      user: updatedUser,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error);
    
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


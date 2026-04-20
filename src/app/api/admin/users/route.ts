import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET all users from Supabase Auth
export async function GET() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.user_metadata?.name || u.email?.split('@')[0] || 'Unknown',
      email: u.email,
      roles: u.user_metadata?.roles || [u.user_metadata?.role || 'USER'],
      status: 'Active', // Supabase doesn't have a simple 'status' field like this, defaulting to Active
      lastLogin: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never',
      allowedSections: u.user_metadata?.allowedSections || ["Global Dashboard", "Settings"]
    }));

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE a new user in Supabase Auth
export async function POST(request: Request) {
  try {
    const { name, email, password, roles, allowedSections } = await request.json();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, roles, allowedSections }
    });

    if (error) throw error;

    return NextResponse.json(data.user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE user metadata
export async function PATCH(request: Request) {
  try {
    const { id, name, roles, allowedSections, status } = await request.json();

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { name, roles, allowedSections, status }
    });

    if (error) throw error;

    return NextResponse.json(data.user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

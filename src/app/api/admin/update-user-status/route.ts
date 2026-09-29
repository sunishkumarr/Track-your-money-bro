import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Verify caller is logged in and is a superadmin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (callerProfile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden: Superadmin only' }, { status: 403 });
  }

  const { userId, status, role } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // 2. Perform update using admin client
  const adminClient = createAdminClient();
  const updateData: Record<string, any> = {};
  if (status) updateData.account_status = status;
  if (role) updateData.role = role;

  const { data, error } = await adminClient
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data });
}

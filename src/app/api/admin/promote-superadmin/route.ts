import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/promote-superadmin
 *
 * One-time bootstrap endpoint to promote a user to superadmin.
 * Requires the SUPABASE_SERVICE_ROLE_KEY as authorization.
 *
 * Usage (cURL):
 *   curl -X POST http://localhost:3000/api/admin/promote-superadmin \
 *     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"email": "your@email.com"}'
 */
export async function POST(request: NextRequest) {
  // Verify authorization with service role key
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide the service role key as Bearer token.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required in the request body.' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Find the user and promote to superadmin + active
  const { data, error } = await supabase
    .from('users')
    .update({
      role: 'superadmin',
      account_status: 'active',
    })
    .eq('email', email)
    .select('id, email, role, account_status')
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Failed to promote user: ${error.message}` },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: `No user found with email: ${email}` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User ${email} promoted to superadmin and activated.`,
    user: data,
  });
}

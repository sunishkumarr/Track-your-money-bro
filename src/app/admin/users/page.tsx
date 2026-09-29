import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import AdminUserList from './admin-user-list';

export const metadata = {
  title: 'Admin — User Management | Track Money Bro',
  description: 'Review and approve pending user registrations',
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Verify current user is superadmin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Fetch all users with admin privileges
  const adminClient = createAdminClient();
  const { data: users } = await adminClient
    .from('users')
    .select('id, email, first_name, last_name, date_of_birth, account_status, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">👑 User Management</h1>
        <p className="admin-page__subtitle">
          Review registrations, approve or reject user accounts
        </p>
      </div>
      <AdminUserList initialUsers={users ?? []} />
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AppShellClient from './app-shell-client';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch verified user profile using service role to prevent RLS recursion
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile || profile.account_status !== 'active') {
    redirect('/pending-approval');
  }

  // Fetch user categories for global quick-add modal
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('is_hidden', false)
    .order('sort_order', { ascending: true });

  return (
    <AppShellClient user={profile} categories={categories ?? []}>
      {children}
    </AppShellClient>
  );
}

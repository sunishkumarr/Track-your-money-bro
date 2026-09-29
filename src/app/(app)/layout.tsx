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

  // Fetch verified user profile using service role
  const adminClient = createAdminClient();
  let { data: profile } = await adminClient
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  // If profile is missing, automatically upsert as active superadmin
  if (!profile) {
    const { data: newProfile } = await adminClient
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email!,
        display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
        first_name: authUser.user_metadata?.first_name || authUser.email?.split('@')[0] || 'User',
        account_status: 'active',
        role: 'superadmin',
      })
      .select('*')
      .single();

    profile = newProfile;
  }

  // Fallback profile if database is unreachable or profile row is missing
  const safeProfile = profile || {
    id: authUser.id,
    email: authUser.email || '',
    display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
    first_name: authUser.user_metadata?.first_name || authUser.email?.split('@')[0] || 'User',
    last_name: authUser.user_metadata?.last_name || null,
    date_of_birth: authUser.user_metadata?.date_of_birth || null,
    account_status: 'active' as const,
    role: 'superadmin' as const,
    default_currency: 'INR',
    timezone: 'Asia/Kolkata',
    theme_preference: 'system' as const,
    email_reminder_enabled: true,
    email_reminder_time: '22:00:00',
    email_include_summary: true,
    email_include_recurring: true,
    email_include_budget: true,
    menu_layout: {
      sidebar: ['expenses', 'analyze', 'plan', 'settings'],
      header: ['search', 'profile'],
      hamburger: [],
      expense_form_expanded_fields: ['tags', 'payment_method'],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only redirect to pending if explicitly set to pending_approval
  if (profile && profile.account_status === 'pending_approval') {
    redirect('/pending-approval');
  }

  if (profile && (profile.account_status === 'suspended' || profile.account_status === 'rejected')) {
    redirect('/login?error=account_inactive');
  }

  // Fetch user categories for global quick-add modal
  const { data: categories } = await adminClient
    .from('categories')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('is_hidden', false)
    .order('sort_order', { ascending: true });

  return (
    <AppShellClient user={safeProfile} categories={categories ?? []}>
      {children}
    </AppShellClient>
  );
}

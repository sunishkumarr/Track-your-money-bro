import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsView from './settings-view';

export const metadata = {
  title: 'Settings | Track Money Bro',
  description: 'Manage preferences, menu customization, email notifications, and profile',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return <SettingsView user={profile} />;
}

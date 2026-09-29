import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PlanView from './plan-view';

export const metadata = {
  title: 'Plan & Budgets | Track Money Bro',
  description: 'Manage budgets, isolate trip and project timelines, track wishlist goals',
};

export default async function PlanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, category:categories(name, icon)')
    .eq('user_id', user.id);

  const { data: timelines } = await supabase
    .from('timelines')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: wishlist } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', user.id)
    .order('priority', { ascending: true });

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id);

  return (
    <PlanView
      budgets={(budgets as any) ?? []}
      timelines={timelines ?? []}
      wishlist={wishlist ?? []}
      categories={categories ?? []}
      userId={user.id}
    />
  );
}

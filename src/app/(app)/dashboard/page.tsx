import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardView from './dashboard-view';
import type { Expense, Category, Budget, Timeline } from '@/types/database';

export const metadata = {
  title: 'Dashboard | Track Money Bro',
  description: 'Your monthly spending overview, daily burn rate, and financial health',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const adminClient = createAdminClient();

  // 1. Fetch user's active categories
  const { data: categories } = await adminClient
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  // 2. Fetch recent expenses (last 50) with joined categories and tags
  const { data: expenses } = await adminClient
    .from('expenses')
    .select(`
      *,
      category:categories(*),
      tags:expense_tags(tag:tags(*))
    `)
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false })
    .limit(50);

  // 3. Fetch user's active budgets
  const { data: budgets } = await adminClient
    .from('budgets')
    .select('*, category:categories(name, icon)')
    .eq('user_id', user.id);

  // 4. Fetch active timelines/trips
  const { data: timelines } = await adminClient
    .from('timelines')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <DashboardView
      initialExpenses={(expenses as any) ?? []}
      categories={categories ?? []}
      budgets={(budgets as any) ?? []}
      timelines={timelines ?? []}
      userId={user.id}
    />
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExpensesView from './expenses-view';

export const metadata = {
  title: 'Expenses | Track Money Bro',
  description: 'Log and filter every expense, manage categories and tags',
};

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*),
      tags:expense_tags(tag:tags(*))
    `)
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false });

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id);

  return (
    <ExpensesView
      initialExpenses={(expenses as any) ?? []}
      categories={categories ?? []}
      tags={tags ?? []}
      userId={user.id}
    />
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AnalyzeView from './analyze-view';

export const metadata = {
  title: 'Analytics | Track Money Bro',
  description: 'Deep financial analysis, same-day aggregation daily rate calculator, and spending trends',
};

export default async function AnalyzePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id);

  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false });

  return (
    <AnalyzeView
      expenses={(expenses as any) ?? []}
      categories={categories ?? []}
    />
  );
}

-- Migration: Row Level Security policies for all tables

-- ============================================
-- USERS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- ============================================
-- CATEGORIES
-- ============================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- EXPENSES
-- ============================================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- TAGS
-- ============================================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" ON public.tags
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tags" ON public.tags
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tags" ON public.tags
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tags" ON public.tags
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- EXPENSE_TAGS (join table - uses subquery)
-- ============================================
ALTER TABLE public.expense_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expense tags" ON public.expense_tags
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert own expense tags" ON public.expense_tags
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own expense tags" ON public.expense_tags
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

-- ============================================
-- TIMELINES
-- ============================================
ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timelines" ON public.timelines
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own timelines" ON public.timelines
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own timelines" ON public.timelines
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own timelines" ON public.timelines
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- EXPENSE_TIMELINES (join table - uses subquery)
-- ============================================
ALTER TABLE public.expense_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expense timelines" ON public.expense_timelines
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert own expense timelines" ON public.expense_timelines
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own expense timelines" ON public.expense_timelines
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

-- ============================================
-- BUDGETS
-- ============================================
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RECURRING_TEMPLATES
-- ============================================
ALTER TABLE public.recurring_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring templates" ON public.recurring_templates
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recurring templates" ON public.recurring_templates
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recurring templates" ON public.recurring_templates
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own recurring templates" ON public.recurring_templates
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- WISHLIST_ITEMS
-- ============================================
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist items" ON public.wishlist_items
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wishlist items" ON public.wishlist_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wishlist items" ON public.wishlist_items
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own wishlist items" ON public.wishlist_items
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- SAVINGS_CONTRIBUTIONS (uses subquery via wishlist_items)
-- ============================================
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings contributions" ON public.savings_contributions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.wishlist_items WHERE id = wishlist_item_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert own savings contributions" ON public.savings_contributions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.wishlist_items WHERE id = wishlist_item_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own savings contributions" ON public.savings_contributions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.wishlist_items WHERE id = wishlist_item_id AND user_id = auth.uid())
    );

-- ============================================
-- EXPENSE_SPLITS
-- ============================================
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expense splits" ON public.expense_splits
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert own expense splits" ON public.expense_splits
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update own expense splits" ON public.expense_splits
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own expense splits" ON public.expense_splits
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
    );

-- ============================================
-- SPLIT_PARTICIPANTS
-- ============================================
ALTER TABLE public.split_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own split participants" ON public.split_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own split participants" ON public.split_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own split participants" ON public.split_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own split participants" ON public.split_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
    );

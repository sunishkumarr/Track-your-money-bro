-- Migration: Add authentication profile fields and admin approval gate
-- Adds: first_name, last_name, date_of_birth, account_status, role

-- ============================================
-- ALTER users table: Add new profile & auth fields
-- ============================================
ALTER TABLE public.users
    ADD COLUMN first_name       VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN last_name        VARCHAR(100),
    ADD COLUMN date_of_birth    DATE,
    ADD COLUMN account_status   VARCHAR(20) NOT NULL DEFAULT 'pending_approval'
        CHECK (account_status IN ('pending_approval', 'active', 'suspended', 'rejected')),
    ADD COLUMN role             VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'superadmin'));

-- Index for admin queries on pending users
CREATE INDEX idx_users_account_status ON public.users(account_status);

-- ============================================
-- Update the user creation trigger to capture new fields
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, email, display_name, first_name, last_name, date_of_birth,
        account_status, role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data ->> 'display_name',
            CONCAT_WS(' ',
                NEW.raw_user_meta_data ->> 'first_name',
                NEW.raw_user_meta_data ->> 'last_name'
            )
        ),
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data ->> 'last_name',
        CASE
            WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL
            THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE
            ELSE NULL
        END,
        'pending_approval',  -- All new users start as pending
        'user'               -- Default role
    );
    -- Seed default categories for the new user
    PERFORM public.seed_default_categories(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS: Superadmin can view and update ALL users (for approval workflow)
-- ============================================
CREATE POLICY "Superadmins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'superadmin')
    );

CREATE POLICY "Superadmins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'superadmin')
    );

-- ============================================
-- RLS: Block pending users from accessing ANY data table
-- These policies add an extra account_status check to all existing RLS policies.
-- The approach: we add a helper function that all policies can reference.
-- ============================================
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND account_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Update all data-table RLS policies to require active status
-- Drop and recreate SELECT/INSERT/UPDATE/DELETE on data tables
-- ============================================

-- CATEGORIES
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- EXPENSES
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- TAGS
DROP POLICY IF EXISTS "Users can view own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags;

CREATE POLICY "Users can view own tags" ON public.tags
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own tags" ON public.tags
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own tags" ON public.tags
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own tags" ON public.tags
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- TIMELINES
DROP POLICY IF EXISTS "Users can view own timelines" ON public.timelines;
DROP POLICY IF EXISTS "Users can insert own timelines" ON public.timelines;
DROP POLICY IF EXISTS "Users can update own timelines" ON public.timelines;
DROP POLICY IF EXISTS "Users can delete own timelines" ON public.timelines;

CREATE POLICY "Users can view own timelines" ON public.timelines
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own timelines" ON public.timelines
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own timelines" ON public.timelines
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own timelines" ON public.timelines
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- BUDGETS
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- RECURRING_TEMPLATES
DROP POLICY IF EXISTS "Users can view own recurring templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can insert own recurring templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can update own recurring templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can delete own recurring templates" ON public.recurring_templates;

CREATE POLICY "Users can view own recurring templates" ON public.recurring_templates
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own recurring templates" ON public.recurring_templates
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own recurring templates" ON public.recurring_templates
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own recurring templates" ON public.recurring_templates
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- WISHLIST_ITEMS
DROP POLICY IF EXISTS "Users can view own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON public.wishlist_items;

CREATE POLICY "Users can view own wishlist items" ON public.wishlist_items
    FOR SELECT USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can insert own wishlist items" ON public.wishlist_items
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can update own wishlist items" ON public.wishlist_items
    FOR UPDATE USING (user_id = auth.uid() AND public.is_active_user());
CREATE POLICY "Users can delete own wishlist items" ON public.wishlist_items
    FOR DELETE USING (user_id = auth.uid() AND public.is_active_user());

-- EXPENSE_TAGS (join table)
DROP POLICY IF EXISTS "Users can view own expense tags" ON public.expense_tags;
DROP POLICY IF EXISTS "Users can insert own expense tags" ON public.expense_tags;
DROP POLICY IF EXISTS "Users can delete own expense tags" ON public.expense_tags;

CREATE POLICY "Users can view own expense tags" ON public.expense_tags
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can insert own expense tags" ON public.expense_tags
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can delete own expense tags" ON public.expense_tags
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );

-- EXPENSE_TIMELINES (join table)
DROP POLICY IF EXISTS "Users can view own expense timelines" ON public.expense_timelines;
DROP POLICY IF EXISTS "Users can insert own expense timelines" ON public.expense_timelines;
DROP POLICY IF EXISTS "Users can delete own expense timelines" ON public.expense_timelines;

CREATE POLICY "Users can view own expense timelines" ON public.expense_timelines
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can insert own expense timelines" ON public.expense_timelines
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can delete own expense timelines" ON public.expense_timelines
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );

-- SAVINGS_CONTRIBUTIONS
DROP POLICY IF EXISTS "Users can view own savings contributions" ON public.savings_contributions;
DROP POLICY IF EXISTS "Users can insert own savings contributions" ON public.savings_contributions;
DROP POLICY IF EXISTS "Users can delete own savings contributions" ON public.savings_contributions;

CREATE POLICY "Users can view own savings contributions" ON public.savings_contributions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.wishlist_items WHERE id = wishlist_item_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can insert own savings contributions" ON public.savings_contributions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.wishlist_items WHERE id = wishlist_item_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can delete own savings contributions" ON public.savings_contributions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.wishlist_items WHERE id = wishlist_item_id AND user_id = auth.uid())
        AND public.is_active_user()
    );

-- EXPENSE_SPLITS
DROP POLICY IF EXISTS "Users can view own expense splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Users can insert own expense splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Users can update own expense splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Users can delete own expense splits" ON public.expense_splits;

CREATE POLICY "Users can view own expense splits" ON public.expense_splits
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can insert own expense splits" ON public.expense_splits
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can update own expense splits" ON public.expense_splits
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );
CREATE POLICY "Users can delete own expense splits" ON public.expense_splits
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_id AND user_id = auth.uid())
        AND public.is_active_user()
    );

-- SPLIT_PARTICIPANTS
DROP POLICY IF EXISTS "Users can view own split participants" ON public.split_participants;
DROP POLICY IF EXISTS "Users can insert own split participants" ON public.split_participants;
DROP POLICY IF EXISTS "Users can update own split participants" ON public.split_participants;
DROP POLICY IF EXISTS "Users can delete own split participants" ON public.split_participants;

CREATE POLICY "Users can view own split participants" ON public.split_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
        AND public.is_active_user()
    );
CREATE POLICY "Users can insert own split participants" ON public.split_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
        AND public.is_active_user()
    );
CREATE POLICY "Users can update own split participants" ON public.split_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
        AND public.is_active_user()
    );
CREATE POLICY "Users can delete own split participants" ON public.split_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.expense_splits es
            JOIN public.expenses e ON e.id = es.expense_id
            WHERE es.id = split_id AND e.user_id = auth.uid()
        )
        AND public.is_active_user()
    );

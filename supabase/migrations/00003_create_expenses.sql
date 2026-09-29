-- Migration: Create expenses table

CREATE TABLE public.expenses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES public.categories(id),
    amount              DECIMAL(12,2) NOT NULL,
    transaction_type    VARCHAR(20) NOT NULL DEFAULT 'expense'
        CHECK (transaction_type IN ('expense', 'income', 'transfer')),
    description         TEXT NOT NULL,
    payment_method      VARCHAR(30)
        CHECK (payment_method IS NULL OR payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'wallet')),
    expense_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    daily_rate          DECIMAL(10,2),
    is_pending          BOOLEAN DEFAULT FALSE,
    recurring_id        UUID,  -- will add FK after recurring_templates is created
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_expenses_type ON public.expenses(transaction_type);
CREATE INDEX idx_expenses_payment ON public.expenses(payment_method);
CREATE INDEX idx_expenses_pending ON public.expenses(is_pending) WHERE is_pending = TRUE;

CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

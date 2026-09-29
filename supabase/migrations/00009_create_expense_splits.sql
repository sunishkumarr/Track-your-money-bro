-- Migration: Create expense_splits and split_participants tables

CREATE TABLE public.expense_splits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id      UUID NOT NULL UNIQUE REFERENCES public.expenses(id) ON DELETE CASCADE,
    total_amount    DECIMAL(12,2) NOT NULL,
    user_share      DECIMAL(12,2) NOT NULL,
    split_method    VARCHAR(20) DEFAULT 'equal'
        CHECK (split_method IN ('equal', 'custom')),
    num_participants INT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_splits_expense ON public.expense_splits(expense_id);

CREATE TABLE public.split_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    split_id        UUID NOT NULL REFERENCES public.expense_splits(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    is_settled      BOOLEAN DEFAULT FALSE,
    settled_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_participants_split ON public.split_participants(split_id);
CREATE INDEX idx_participants_unsettled ON public.split_participants(is_settled) WHERE is_settled = FALSE;

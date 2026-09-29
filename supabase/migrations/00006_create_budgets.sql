-- Migration: Create budgets table

CREATE TABLE public.budgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name            VARCHAR(150),
    amount          DECIMAL(12,2) NOT NULL,
    period_type     VARCHAR(20) NOT NULL
        CHECK (period_type IN ('weekly', 'monthly', 'yearly', 'custom')),
    start_date      DATE NOT NULL,
    end_date        DATE,
    category_id     UUID REFERENCES public.categories(id),
    timeline_id     UUID REFERENCES public.timelines(id),
    rollover        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budgets_user ON public.budgets(user_id);
CREATE INDEX idx_budgets_period ON public.budgets(period_type, start_date);

CREATE TRIGGER trg_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

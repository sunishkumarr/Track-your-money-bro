-- Migration: Create timelines and expense_timelines tables

CREATE TABLE public.timelines (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    start_date  DATE NOT NULL,
    end_date    DATE,
    budget      DECIMAL(12,2),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timelines_user ON public.timelines(user_id);

CREATE TRIGGER trg_timelines_updated_at
    BEFORE UPDATE ON public.timelines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.expense_timelines (
    expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    timeline_id UUID NOT NULL REFERENCES public.timelines(id) ON DELETE CASCADE,
    PRIMARY KEY (expense_id, timeline_id)
);

CREATE INDEX idx_expense_timelines_timeline ON public.expense_timelines(timeline_id);

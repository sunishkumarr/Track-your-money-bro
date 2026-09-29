-- Migration: Create recurring_templates table

CREATE TABLE public.recurring_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES public.categories(id),
    amount          DECIMAL(12,2) NOT NULL,
    description     TEXT NOT NULL,
    payment_method  VARCHAR(30),
    frequency       VARCHAR(20) NOT NULL
        CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_due_date   DATE NOT NULL,
    end_date        DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_user ON public.recurring_templates(user_id);
CREATE INDEX idx_recurring_due ON public.recurring_templates(next_due_date) WHERE is_active = TRUE;

CREATE TRIGGER trg_recurring_updated_at
    BEFORE UPDATE ON public.recurring_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Add FK from expenses to recurring_templates now that both tables exist
ALTER TABLE public.expenses
    ADD CONSTRAINT fk_expenses_recurring
    FOREIGN KEY (recurring_id) REFERENCES public.recurring_templates(id) ON DELETE SET NULL;

-- Migration: Create tags and expense_tags tables

CREATE TABLE public.tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user ON public.tags(user_id);

CREATE TABLE public.expense_tags (
    expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (expense_id, tag_id)
);

CREATE INDEX idx_expense_tags_tag ON public.expense_tags(tag_id);

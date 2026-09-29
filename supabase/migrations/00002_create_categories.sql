-- Migration: Create categories table (self-referencing for subcategories)

CREATE TABLE public.categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    icon                VARCHAR(10),
    parent_id           UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_default          BOOLEAN DEFAULT FALSE,
    is_hidden           BOOLEAN DEFAULT FALSE,
    daily_rate_enabled  BOOLEAN DEFAULT FALSE,
    sort_order          INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name, parent_id)
);

CREATE INDEX idx_categories_user ON public.categories(user_id);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

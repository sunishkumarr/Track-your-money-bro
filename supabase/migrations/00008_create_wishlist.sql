-- Migration: Create wishlist_items and savings_contributions tables

CREATE TABLE public.wishlist_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    target_amount           DECIMAL(12,2) NOT NULL,
    saved_amount            DECIMAL(12,2) DEFAULT 0,
    target_date             DATE,
    priority                VARCHAR(10) DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),
    category_id             UUID REFERENCES public.categories(id),
    status                  VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'achieved', 'purchased', 'abandoned')),
    converted_expense_id    UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlist_user ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_status ON public.wishlist_items(status) WHERE status = 'active';

CREATE TRIGGER trg_wishlist_updated_at
    BEFORE UPDATE ON public.wishlist_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.savings_contributions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_item_id    UUID NOT NULL REFERENCES public.wishlist_items(id) ON DELETE CASCADE,
    amount              DECIMAL(12,2) NOT NULL,
    note                TEXT,
    contributed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_item ON public.savings_contributions(wishlist_item_id);

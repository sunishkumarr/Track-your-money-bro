-- Migration: Add per-user customizable menu layout
-- Users can configure which features appear in sidebar, header, or hamburger menu

ALTER TABLE public.users
    ADD COLUMN menu_layout JSONB NOT NULL DEFAULT '{
        "sidebar": ["expenses", "analyze", "plan", "settings"],
        "header": ["search", "profile"],
        "hamburger": [],
        "expense_form_expanded_fields": ["tags", "timelines", "split", "payment_method"]
    }'::jsonb;

-- Validate the JSONB structure with a CHECK constraint
ALTER TABLE public.users
    ADD CONSTRAINT chk_menu_layout_valid CHECK (
        menu_layout ? 'sidebar'
        AND menu_layout ? 'header'
        AND menu_layout ? 'hamburger'
        AND jsonb_typeof(menu_layout -> 'sidebar') = 'array'
        AND jsonb_typeof(menu_layout -> 'header') = 'array'
        AND jsonb_typeof(menu_layout -> 'hamburger') = 'array'
    );

COMMENT ON COLUMN public.users.menu_layout IS
'User-customizable navigation layout. Keys:
- sidebar: features shown as icons in the persistent sidebar (max 6). Default: expenses, analyze, plan, settings
- header: items shown in the top header bar. Default: search, profile
- hamburger: features accessible via the overflow/drawer menu. Default: empty (all in sidebar)
- expense_form_expanded_fields: which "More options" fields are expanded by default on the expense form

Valid feature keys: expenses, analyze, plan, settings, dashboard, budgets, timelines, wishlist, recurring, settlements, tags, export, search, profile';

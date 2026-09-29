-- Migration: Create triggers

-- ============================================
-- Auto-update saved_amount on wishlist_items when savings_contributions change
-- ============================================
CREATE OR REPLACE FUNCTION public.update_wishlist_saved_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.wishlist_items
        SET saved_amount = saved_amount + NEW.amount,
            status = CASE
                WHEN saved_amount + NEW.amount >= target_amount AND status = 'active' THEN 'achieved'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = NEW.wishlist_item_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.wishlist_items
        SET saved_amount = GREATEST(0, saved_amount - OLD.amount),
            status = CASE
                WHEN saved_amount - OLD.amount < target_amount AND status = 'achieved' THEN 'active'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = OLD.wishlist_item_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_savings_contribution_change
    AFTER INSERT OR DELETE ON public.savings_contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wishlist_saved_amount();

-- Migration 14: Fix superadmin RLS infinite recursion on public.users
-- Uses a SECURITY DEFINER helper function to safely verify superadmin status

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop recursive policies
DROP POLICY IF EXISTS "Superadmins can view all users" ON public.users;
DROP POLICY IF EXISTS "Superadmins can update all users" ON public.users;

-- Recreate with SECURITY DEFINER helper
CREATE POLICY "Superadmins can view all users" ON public.users
    FOR SELECT USING (public.is_superadmin());

CREATE POLICY "Superadmins can update all users" ON public.users
    FOR UPDATE USING (public.is_superadmin());

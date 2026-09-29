-- Migration: Create users table (extends Supabase Auth)
-- This creates a public.users profile table linked to auth.users

CREATE TABLE public.users (
    id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                   VARCHAR(255) UNIQUE NOT NULL,
    display_name            VARCHAR(100),
    default_currency        VARCHAR(3) DEFAULT 'INR',
    timezone                VARCHAR(50) DEFAULT 'Asia/Kolkata',
    theme_preference        VARCHAR(10) DEFAULT 'system'
        CHECK (theme_preference IN ('light', 'dark', 'system')),
    email_reminder_enabled  BOOLEAN DEFAULT TRUE,
    email_reminder_time     TIME DEFAULT '22:00',
    email_include_summary   BOOLEAN DEFAULT TRUE,
    email_include_recurring BOOLEAN DEFAULT TRUE,
    email_include_budget    BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

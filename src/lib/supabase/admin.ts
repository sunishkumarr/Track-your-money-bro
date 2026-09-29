import { createClient } from '@supabase/supabase-js';

// Service-role client — only use in API routes and server actions
// This bypasses RLS — use with caution
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <div className="auth-layout__card" style={{ textAlign: 'center' }}>
          <div className="pending-approval__icon">⏳</div>
          <h2 className="auth-form__title">Account Pending Approval</h2>
          <p className="pending-approval__message">
            Your account has been created successfully, but it requires
            administrator approval before you can access the application.
          </p>
          <p className="pending-approval__info">
            You will be able to sign in once an administrator reviews and
            approves your account. This usually happens within 24 hours.
          </p>
          <button
            onClick={handleSignOut}
            className="auth-form__submit auth-form__submit--secondary"
            style={{ marginTop: '1.5rem' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';

interface HeaderProps {
  user: User;
  onOpenAddModal: () => void;
}

export default function Header({ user, onOpenAddModal }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName = user.display_name || user.first_name || user.email.split('@')[0];

  return (
    <header className="app-header">
      <div className="app-header__left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>👋</span>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            Welcome back, <strong style={{ color: 'var(--accent)' }}>{displayName}</strong>
          </span>
        </div>
      </div>

      <div className="app-header__right">
        <button
          onClick={onOpenAddModal}
          className="btn-primary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
        >
          <span>➕</span>
          <span>Log Expense</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            <div
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span>▾</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '120%',
                width: '13rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div>{displayName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{user.email}</div>
              </div>

              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ⚙️ Settings & Layout
              </Link>

              {user.role === 'superadmin' && (
                <Link
                  href="/admin/users"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8125rem',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  👑 User Approvals
                </Link>
              )}

              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--danger)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

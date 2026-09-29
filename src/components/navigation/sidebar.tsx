'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types/database';

interface SidebarProps {
  role?: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/expenses', label: 'Expenses', icon: '💳' },
    { href: '/analyze', label: 'Analyze', icon: '📈' },
    { href: '/plan', label: 'Plan', icon: '🎯' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <span className="app-sidebar__brand-icon">💸</span>
        <span className="app-sidebar__brand-name">Track Money Bro</span>
      </div>

      <nav className="app-sidebar__nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}
            >
              <span className="app-sidebar__link-icon">{item.icon}</span>
              <span className="app-sidebar__link-label">{item.label}</span>
            </Link>
          );
        })}

        {role === 'superadmin' && (
          <Link
            href="/admin/users"
            className={`app-sidebar__link ${pathname.startsWith('/admin') ? 'app-sidebar__link--active' : ''}`}
            style={{ marginTop: 'auto' }}
          >
            <span className="app-sidebar__link-icon">👑</span>
            <span className="app-sidebar__link-label">Admin Portal</span>
          </Link>
        )}
      </nav>

      <div className="app-sidebar__footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Track Money Bro v1.0
        </div>
      </div>
    </aside>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/navigation/sidebar';
import Header from '@/components/navigation/header';
import TransactionModal from '@/components/expenses/transaction-modal';
import type { Category, User } from '@/types/database';

interface AppShellClientProps {
  user: User;
  categories: Category[];
  children: React.ReactNode;
}

export default function AppShellClient({
  user,
  categories,
  children,
}: AppShellClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavItems = [
    { href: '/dashboard', label: 'Home', icon: '📊' },
    { href: '/expenses', label: 'Expenses', icon: '💳' },
    { href: '/analyze', label: 'Analyze', icon: '📈' },
    { href: '/plan', label: 'Plan', icon: '🎯' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="app-shell">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar role={user?.role} />

      <div className="app-body">
        {/* Top Header */}
        <Header user={user} onOpenAddModal={() => setModalOpen(true)} />

        {/* Main Content Area */}
        <main className="app-main">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-nav">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        userId={user.id}
      />
    </div>
  );
}

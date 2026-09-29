'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { ExpenseWithRelations, Category, Budget, Timeline } from '@/types/database';

interface DashboardViewProps {
  initialExpenses: ExpenseWithRelations[];
  categories: Category[];
  budgets: Budget[];
  timelines: Timeline[];
  userId: string;
}

export default function DashboardView({
  initialExpenses,
  categories,
  budgets,
  timelines,
  userId,
}: DashboardViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter for current month metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses
    .filter((e) => e.transaction_type === 'expense')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalIncome = currentMonthExpenses
    .filter((e) => e.transaction_type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const netSavings = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Same-Day Aggregation Daily Burn Rate calculation
  // Sum expenses per calendar date, then divide by active days elapsed
  const daysElapsed = Math.max(1, now.getDate());
  const dailyBurnRate = Math.round(totalSpent / daysElapsed);

  // Group by category for distribution
  const categorySpendMap: Record<string, { name: string; icon: string; amount: number; color: string }> = {};
  currentMonthExpenses
    .filter((e) => e.transaction_type === 'expense')
    .forEach((e) => {
      const catName = e.category?.name || 'Uncategorized';
      const icon = e.category?.icon || '📁';
      if (!categorySpendMap[catName]) {
        categorySpendMap[catName] = { name: catName, icon, amount: 0, color: 'var(--accent)' };
      }
      categorySpendMap[catName].amount += Number(e.amount);
    });

  const categorySpendList = Object.values(categorySpendMap).sort((a, b) => b.amount - a.amount);

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      router.refresh();
    }
    setDeletingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Financial Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} • Intentional Spending Journal
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__title">Total Spent</span>
            <div className="stat-card__icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
              💸
            </div>
          </div>
          <div className="stat-card__value" style={{ color: 'var(--danger)' }}>
            {formatCurrency(totalSpent)}
          </div>
          <div className="stat-card__footer">
            <span>📅 {currentMonthExpenses.filter(e => e.transaction_type === 'expense').length} expenses logged this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__title">Total Income</span>
            <div className="stat-card__icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              💰
            </div>
          </div>
          <div className="stat-card__value" style={{ color: 'var(--success)' }}>
            {formatCurrency(totalIncome)}
          </div>
          <div className="stat-card__footer">
            <span>📈 {savingsRate}% savings rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__title">Net Cashflow</span>
            <div className="stat-card__icon" style={{ background: netSavings >= 0 ? 'var(--success-light)' : 'var(--danger-light)' }}>
              {netSavings >= 0 ? '✨' : '⚠️'}
            </div>
          </div>
          <div className="stat-card__value" style={{ color: netSavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(netSavings)}
          </div>
          <div className="stat-card__footer">
            <span>{netSavings >= 0 ? '🟢 In the green' : '🔴 Deficit this month'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__title">Daily Burn Rate</span>
            <div className="stat-card__icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              ⚡
            </div>
          </div>
          <div className="stat-card__value" style={{ color: 'var(--accent)' }}>
            {formatCurrency(dailyBurnRate)}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}> / day</span>
          </div>
          <div className="stat-card__footer">
            <span>📊 Aggregated over {daysElapsed} days elapsed</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Transactions & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Recent Transactions</h2>
                <p className="card__subtitle">Your latest logged spending & income</p>
              </div>
              <Link href="/expenses" className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                View All →
              </Link>
            </div>

            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  No transactions logged yet
                </h3>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem', maxWidth: '20rem', margin: '0 auto' }}>
                  Click the <strong>Log Expense</strong> button at the top to record your first transaction!
                </p>
              </div>
            ) : (
              <div className="txn-list">
                {expenses.slice(0, 8).map((txn) => {
                  const isExpense = txn.transaction_type === 'expense';
                  return (
                    <div key={txn.id} className="txn-item">
                      <div className="txn-item__left">
                        <div className="txn-item__icon">
                          {txn.category?.icon || (isExpense ? '💸' : '💰')}
                        </div>
                        <div className="txn-item__details">
                          <div className="txn-item__desc">{txn.description}</div>
                          <div className="txn-item__meta">
                            <span>{txn.category?.name || 'General'}</span>
                            <span>•</span>
                            <span>{formatDateTime(txn.expense_date)}</span>
                            {txn.tags && txn.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  {txn.tags.map((t: any) => (
                                    <span key={t.tag?.id || t.id} className="tag-chip">
                                      #{t.tag?.name || t.name}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="txn-item__right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          className={`txn-item__amount ${isExpense ? 'txn-item__amount--expense' : 'txn-item__amount--income'}`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(Number(txn.amount))}
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(txn.id)}
                          disabled={deletingId === txn.id}
                          title="Delete transaction"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            padding: '0.25rem',
                          }}
                        >
                          {deletingId === txn.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Breakdown & Quick Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Spend Distribution */}
          <div className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Category Breakdown</h2>
                <p className="card__subtitle">Where your money went this month</p>
              </div>
              <Link href="/analyze" className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                Analyze →
              </Link>
            </div>

            {categorySpendList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                No category expenses to display yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {categorySpendList.slice(0, 6).map((cat) => {
                  const percent = totalSpent > 0 ? Math.round((cat.amount / totalSpent) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatCurrency(cat.amount)}{' '}
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({percent}%)</span>
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '0.375rem', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: 'var(--accent)',
                            borderRadius: '9999px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Planning / Trips Widget */}
          <div className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Planning & Trips</h2>
                <p className="card__subtitle">Active isolated budgets</p>
              </div>
              <Link href="/plan" className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                Plan →
              </Link>
            </div>

            {timelines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                <div>✈️ No active trips or event timelines</div>
                <Link href="/plan" style={{ color: 'var(--accent)', marginTop: '0.5rem', display: 'inline-block', textDecoration: 'underline' }}>
                  Create a timeline
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {timelines.map((tl) => (
                  <div
                    key={tl.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.875rem' }}>
                      <span>🎯 {tl.name}</span>
                      {tl.budget && <span style={{ color: 'var(--accent)' }}>Budget: {formatCurrency(Number(tl.budget))}</span>}
                    </div>
                    {tl.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {tl.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

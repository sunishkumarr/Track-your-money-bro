'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { ExpenseWithRelations, Category, Tag } from '@/types/database';

interface ExpensesViewProps {
  initialExpenses: ExpenseWithRelations[];
  categories: Category[];
  tags: Tag[];
  userId: string;
}

export default function ExpensesView({
  initialExpenses,
  categories,
  tags,
  userId,
}: ExpensesViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = expenses.filter((e) => {
    if (selectedType !== 'all' && e.transaction_type !== selectedType) return false;
    if (selectedCategory !== 'all' && e.category_id !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchCat = e.category?.name.toLowerCase().includes(q);
      const matchTag = e.tags?.some((t: any) =>
        (t.tag?.name || t.name || '').toLowerCase().includes(q)
      );
      if (!matchDesc && !matchCat && !matchTag) return false;
    }
    return true;
  });

  const totalSum = filtered.reduce((sum, e) => {
    return e.transaction_type === 'income' ? sum + Number(e.amount) : sum - Number(e.amount);
  }, 0);

  const handleDelete = async (id: string) => {
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            💳 Expense & Income Ledger
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Showing {filtered.length} of {expenses.length} records • Net: {formatCurrency(Math.abs(totalSum))}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flex: 1, minWidth: '15rem', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Search descriptions, categories, or #tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="auth-form__input"
            style={{ padding: '0.5rem 0.75rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="auth-form__input"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="auth-form__input"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon || '📁'} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No transactions match your search
            </h3>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Try clearing filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="txn-list">
            {filtered.map((txn) => {
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
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {txn.category?.name || 'General'}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(txn.expense_date)}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'uppercase' }}>{txn.payment_method || 'UPI'}</span>
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
                      onClick={() => handleDelete(txn.id)}
                      disabled={deletingId === txn.id}
                      title="Delete"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
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
  );
}

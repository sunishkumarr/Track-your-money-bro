'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Budget, Timeline, WishlistItem, Category } from '@/types/database';

interface PlanViewProps {
  budgets: Budget[];
  timelines: Timeline[];
  wishlist: WishlistItem[];
  categories: Category[];
  userId: string;
}

export default function PlanView({
  budgets: initialBudgets,
  timelines: initialTimelines,
  wishlist: initialWishlist,
  categories,
  userId,
}: PlanViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'budgets' | 'timelines' | 'wishlist'>('budgets');

  const [timelines, setTimelines] = useState(initialTimelines);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [wishlist, setWishlist] = useState(initialWishlist);

  // New Timeline Form Modal state
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [tlName, setTlName] = useState('');
  const [tlBudget, setTlBudget] = useState('');
  const [tlDesc, setTlDesc] = useState('');
  const [tlLoading, setTlLoading] = useState(false);

  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tlName.trim()) return;
    setTlLoading(true);

    const { data, error } = await supabase
      .from('timelines')
      .insert({
        user_id: userId,
        name: tlName.trim(),
        budget: tlBudget ? parseFloat(tlBudget) : null,
        description: tlDesc.trim() || null,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (!error && data) {
      setTimelines((prev) => [data, ...prev]);
      setShowTimelineModal(false);
      setTlName('');
      setTlBudget('');
      setTlDesc('');
      router.refresh();
    }
    setTlLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          🎯 Financial Planning
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Budgets, isolated trip timelines, and savings goals
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`admin-users__filter-btn ${activeTab === 'budgets' ? 'admin-users__filter-btn--active' : ''}`}
        >
          📊 Budgets ({budgets.length})
        </button>
        <button
          onClick={() => setActiveTab('timelines')}
          className={`admin-users__filter-btn ${activeTab === 'timelines' ? 'admin-users__filter-btn--active' : ''}`}
        >
          ✈️ Timelines & Trips ({timelines.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`admin-users__filter-btn ${activeTab === 'wishlist' ? 'admin-users__filter-btn--active' : ''}`}
        >
          🎁 Wishlist Goals ({wishlist.length})
        </button>
      </div>

      {/* Tab 1: Budgets */}
      {activeTab === 'budgets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {budgets.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Budgets Configured</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Set monthly spending limits for categories to track and avoid overspending.
              </p>
            </div>
          ) : (
            <div className="stat-grid">
              {budgets.map((b: any) => (
                <div key={b.id} className="stat-card">
                  <div className="stat-card__header">
                    <span className="stat-card__title">{b.name}</span>
                    <span>{b.category?.icon || '📁'}</span>
                  </div>
                  <div className="stat-card__value" style={{ color: 'var(--accent)' }}>
                    {formatCurrency(Number(b.amount))}
                  </div>
                  <div className="stat-card__footer">
                    <span>{b.period_type.toUpperCase()} budget</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Timelines & Trips */}
      {activeTab === 'timelines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowTimelineModal(true)} className="btn-primary">
              ➕ Create Trip / Timeline
            </button>
          </div>

          {timelines.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✈️</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Timelines Created</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Timelines let you isolate spending for trips, renovations, or events without polluting your regular monthly budget.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {timelines.map((tl) => (
                <div key={tl.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>✈️ {tl.name}</h3>
                    {tl.budget && (
                      <span className="badge badge--accent">Budget: {formatCurrency(Number(tl.budget))}</span>
                    )}
                  </div>
                  {tl.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {tl.description}
                    </p>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Started: {formatDate(tl.start_date)}
                    {tl.end_date && ` • Ends: ${formatDate(tl.end_date)}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Timeline Modal */}
          {showTimelineModal && (
            <div className="modal-backdrop" onClick={() => setShowTimelineModal(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">✈️ Create Planning Timeline</h3>
                  <button className="modal-close" onClick={() => setShowTimelineModal(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateTimeline} className="auth-form">
                  <div className="auth-form__field">
                    <label className="auth-form__label">Timeline Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Goa Vacation 2026, Home Renovation"
                      value={tlName}
                      onChange={(e) => setTlName(e.target.value)}
                      className="auth-form__input"
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Budget Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={tlBudget}
                      onChange={(e) => setTlBudget(e.target.value)}
                      className="auth-form__input"
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label">Description</label>
                    <input
                      type="text"
                      placeholder="Trip notes or goal..."
                      value={tlDesc}
                      onChange={(e) => setTlDesc(e.target.value)}
                      className="auth-form__input"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setShowTimelineModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={tlLoading} className="btn-primary" style={{ flex: 2 }}>
                      {tlLoading ? 'Creating...' : 'Create Timeline'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {wishlist.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎁</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Wishlist is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Track items you want to buy and allocate savings toward them over time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {wishlist.map((item) => (
                <div key={item.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: 700 }}>🎁 {item.name}</h4>
                    <span className="badge badge--accent">{formatCurrency(Number(item.target_amount))}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Saved: {formatCurrency(Number(item.saved_amount))} / {formatCurrency(Number(item.target_amount))}
                  </div>
                  <div style={{ width: '100%', height: '0.5rem', background: 'var(--border)', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.round((Number(item.saved_amount) / Number(item.target_amount)) * 100))}%`,
                        height: '100%',
                        background: 'var(--success)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

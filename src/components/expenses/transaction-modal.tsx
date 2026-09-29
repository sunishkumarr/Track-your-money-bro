'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Category, PaymentMethod, TransactionType } from '@/types/database';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  userId: string;
}

export default function TransactionModal({
  isOpen,
  onClose,
  categories,
  userId,
}: TransactionModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 16));
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Filter categories by transaction type
  const visibleCategories = categories.filter((c) =>
    type === 'income' ? c.is_income : !c.is_income
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    setLoading(true);

    try {
      // 1. Insert expense
      const { data: expense, error: insertError } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          category_id: categoryId,
          amount: parsedAmount,
          transaction_type: type,
          description: description.trim(),
          payment_method: paymentMethod,
          expense_date: new Date(expenseDate).toISOString(),
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // 2. Handle tags if any
      const rawTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      for (const tagName of rawTags) {
        // Upsert tag
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', userId)
          .eq('name', tagName)
          .maybeSingle();

        let tagId = tagData?.id;

        if (!tagId) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ user_id: userId, name: tagName })
            .select('id')
            .single();
          tagId = newTag?.id;
        }

        if (tagId && expense?.id) {
          await supabase
            .from('expense_tags')
            .insert({ expense_id: expense.id, tag_id: tagId });
        }
      }

      setLoading(false);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {type === 'expense' ? '💸 Log Expense' : '💰 Log Income'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Type selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            background: 'var(--bg-primary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('');
            }}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: type === 'expense' ? 'var(--accent)' : 'transparent',
              color: type === 'expense' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('');
            }}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: type === 'income' ? 'var(--success)' : 'transparent',
              color: type === 'income' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Income
          </button>
        </div>

        {error && <div className="auth-form__error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Amount input */}
          <div className="auth-form__field">
            <label className="auth-form__label">
              Amount (₹) <span className="auth-form__required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 750.00"
              className="auth-form__input"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="auth-form__field">
            <label className="auth-form__label">
              Category <span className="auth-form__required">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="auth-form__input"
            >
              <option value="">Select a category...</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon || '📁'} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="auth-form__field">
            <label className="auth-form__label">
              Description <span className="auth-form__required">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on? (e.g. Biryani lunch, Metro card)"
              className="auth-form__input"
            />
          </div>

          <div className="auth-form__row">
            {/* Payment Method */}
            <div className="auth-form__field">
              <label className="auth-form__label">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="auth-form__input"
              >
                <option value="upi">📱 UPI</option>
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="bank_transfer">🏦 Net Banking</option>
                <option value="wallet">👛 Wallet</option>
              </select>
            </div>

            {/* Date & Time */}
            <div className="auth-form__field">
              <label className="auth-form__label">Date & Time</label>
              <input
                type="datetime-local"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="auth-form__input"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="auth-form__field">
            <label className="auth-form__label">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. weekend, dining, office"
              className="auth-form__input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {loading ? 'Saving...' : '💾 Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

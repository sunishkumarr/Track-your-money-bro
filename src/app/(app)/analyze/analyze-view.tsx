'use client';

import { formatCurrency } from '@/lib/utils';
import type { ExpenseWithRelations, Category } from '@/types/database';

interface AnalyzeViewProps {
  expenses: ExpenseWithRelations[];
  categories: Category[];
}

export default function AnalyzeView({ expenses, categories }: AnalyzeViewProps) {
  const expenseTransactions = expenses.filter((e) => e.transaction_type === 'expense');
  const incomeTransactions = expenses.filter((e) => e.transaction_type === 'income');

  const totalExpense = expenseTransactions.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncome = incomeTransactions.reduce((sum, e) => sum + Number(e.amount), 0);
  const netSavings = totalIncome - totalExpense;

  // Category Spend Distribution
  const categoryMap: Record<string, { name: string; icon: string; amount: number; count: number }> = {};
  expenseTransactions.forEach((e) => {
    const name = e.category?.name || 'Other';
    const icon = e.category?.icon || '📁';
    if (!categoryMap[name]) {
      categoryMap[name] = { name, icon, amount: 0, count: 0 };
    }
    categoryMap[name].amount += Number(e.amount);
    categoryMap[name].count += 1;
  });

  const categoryList = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

  // Payment method distribution
  const paymentMap: Record<string, number> = {};
  expenseTransactions.forEach((e) => {
    const method = (e.payment_method || 'upi').toUpperCase();
    paymentMap[method] = (paymentMap[method] || 0) + Number(e.amount);
  });

  // Daily Rate Calculator: Same-Day Aggregation
  // For each category, group expenses by distinct calendar dates, sum them first, then calculate intervals
  const dailyRateCategories = categories.filter((c) => c.daily_rate_enabled);
  const dailyRateResults = dailyRateCategories.map((cat) => {
    const catExpenses = expenseTransactions.filter((e) => e.category_id === cat.id);
    if (catExpenses.length < 2) {
      return {
        category: cat,
        totalSpend: catExpenses.reduce((s, e) => s + Number(e.amount), 0),
        dailyRate: null,
        distinctDates: catExpenses.length,
      };
    }

    // Map by calendar date (YYYY-MM-DD)
    const dateSums: Record<string, number> = {};
    catExpenses.forEach((e) => {
      const dateStr = new Date(e.expense_date).toISOString().split('T')[0];
      dateSums[dateStr] = (dateSums[dateStr] || 0) + Number(e.amount);
    });

    const dates = Object.keys(dateSums).sort();
    if (dates.length < 2) {
      return {
        category: cat,
        totalSpend: Object.values(dateSums).reduce((a, b) => a + b, 0),
        dailyRate: null,
        distinctDates: dates.length,
      };
    }

    const firstDate = new Date(dates[0]).getTime();
    const lastDate = new Date(dates[dates.length - 1]).getTime();
    const daysDiff = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
    const totalSpend = Object.values(dateSums).reduce((a, b) => a + b, 0);
    const rate = totalSpend / daysDiff;

    return {
      category: cat,
      totalSpend,
      dailyRate: rate,
      distinctDates: dates.length,
      daysDiff,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          📈 Financial Analytics
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Visual insights, burn rate calculators, and spending patterns
        </p>
      </div>

      {/* KPI Comparison */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__title">Total Recorded Spending</div>
          <div className="stat-card__value" style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>
            {formatCurrency(totalExpense)}
          </div>
          <div className="stat-card__footer">{expenseTransactions.length} total expense entries</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__title">Total Recorded Income</div>
          <div className="stat-card__value" style={{ color: 'var(--success)', marginTop: '0.5rem' }}>
            {formatCurrency(totalIncome)}
          </div>
          <div className="stat-card__footer">{incomeTransactions.length} income transactions</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__title">Net Savings</div>
          <div className="stat-card__value" style={{ color: netSavings >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.5rem' }}>
            {formatCurrency(netSavings)}
          </div>
          <div className="stat-card__footer">
            {totalIncome > 0 ? `${Math.round((netSavings / totalIncome) * 100)}% overall savings rate` : 'No income logged'}
          </div>
        </div>
      </div>

      {/* Same-Day Aggregation Daily Rate Calculator */}
      <div className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">⚡ Daily Rate Calculator</h2>
            <p className="card__subtitle">
              Calculated using <strong>Same-Day Aggregation</strong> across recurring/consumable categories (Fuel, Groceries, etc.)
            </p>
          </div>
        </div>

        {dailyRateResults.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No categories have Daily Rate enabled. Enable it on categories in Settings or Category management.
          </p>
        ) : (
          <div className="admin-users__table-wrapper">
            <table className="admin-users__table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Spend</th>
                  <th>Distinct Days Logged</th>
                  <th>Calculated Daily Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyRateResults.map((res) => (
                  <tr key={res.category.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {res.category.icon} {res.category.name}
                      </span>
                    </td>
                    <td>{formatCurrency(res.totalSpend)}</td>
                    <td>{res.distinctDates} days</td>
                    <td>
                      {res.dailyRate ? (
                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          {formatCurrency(res.dailyRate)} / day
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Need at least 2 distinct dates</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge--success">Option A Aggregated</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Spend Distribution */}
      <div className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Category Spending Distribution</h2>
            <p className="card__subtitle">Aggregated totals and percentage breakdown</p>
          </div>
        </div>

        {categoryList.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No expenses logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryList.map((c) => {
              const percent = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>({c.count} transactions)</span>
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {formatCurrency(c.amount)} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>({percent}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '0.5rem', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent)', borderRadius: '9999px' }} />
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

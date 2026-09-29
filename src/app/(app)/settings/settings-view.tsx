'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, MenuLayout } from '@/types/database';

interface SettingsViewProps {
  user: User;
}

export default function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [currency, setCurrency] = useState(user.default_currency || 'INR');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Kolkata');
  const [theme, setTheme] = useState(user.theme_preference || 'system');
  const [emailReminder, setEmailReminder] = useState(user.email_reminder_enabled ?? true);
  const [reminderTime, setReminderTime] = useState(user.email_reminder_time || '22:00');

  // Menu layout customization
  const defaultLayout: MenuLayout = user.menu_layout || {
    sidebar: ['expenses', 'analyze', 'plan', 'settings'],
    header: ['search', 'profile'],
    hamburger: [],
    expense_form_expanded_fields: ['tags', 'timelines', 'payment_method'],
  };
  const [menuLayout, setMenuLayout] = useState<MenuLayout>(defaultLayout);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const { error } = await supabase
      .from('users')
      .update({
        display_name: displayName.trim() || null,
        default_currency: currency,
        timezone,
        theme_preference: theme,
        email_reminder_enabled: emailReminder,
        email_reminder_time: reminderTime,
        menu_layout: menuLayout,
      })
      .eq('id', user.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Settings and menu layout saved successfully!');
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          ⚙️ Account & Menu Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Customize your profile, notification reminders, and navigation layout
        </p>
      </div>

      {successMsg && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success)' }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="auth-form__error-banner">{errorMsg}</div>
      )}

      <form onSubmit={handleSave} className="auth-form">
        {/* Profile Card */}
        <div className="card">
          <h2 className="card__title" style={{ marginBottom: '1rem' }}>User Profile</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="auth-form__field">
              <label className="auth-form__label">Email Address</label>
              <input
                type="text"
                disabled
                value={user.email}
                className="auth-form__input"
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="auth-form__field">
              <label className="auth-form__label">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John"
                className="auth-form__input"
              />
            </div>

            <div className="auth-form__row">
              <div className="auth-form__field">
                <label className="auth-form__label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="auth-form__input"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="auth-form__input"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Email Reminders Card */}
        <div className="card">
          <h2 className="card__title" style={{ marginBottom: '1rem' }}>Daily Spending Journal Reminder</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailReminder}
                onChange={(e) => setEmailReminder(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent)' }}
              />
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                Enable daily end-of-day email reminder to log unrecorded expenses
              </span>
            </label>

            {emailReminder && (
              <div className="auth-form__field" style={{ maxWidth: '14rem' }}>
                <label className="auth-form__label">Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="auth-form__input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Customizable Menu Layout Card */}
        <div className="card">
          <h2 className="card__title" style={{ marginBottom: '0.5rem' }}>Personal Menu Layout Customization</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Configure your navigation preferences. Choose which features appear in your active sidebar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Active Sidebar Features (Default Option 1):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {menuLayout.sidebar.map((item) => (
                <span key={item} className="badge badge--accent" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
                  ✓ {item.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            {saving ? 'Saving...' : '💾 Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

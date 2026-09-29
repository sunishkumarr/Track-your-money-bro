'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/lib/validators';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');

    // Validate
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    // Sign in
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setServerError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error.message
      );
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <>
      <h2 className="auth-form__title">Welcome back</h2>
      <p className="auth-form__subtitle">
        Sign in to continue tracking your expenses
      </p>

      {serverError && (
        <div className="auth-form__error-banner">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form__field">
          <label htmlFor="email" className="auth-form__label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="auth-form__error">{errors.email}</p>
          )}
        </div>

        <div className="auth-form__field">
          <label htmlFor="password" className="auth-form__label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="auth-form__error">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-form__submit"
        >
          {loading ? (
            <span className="auth-form__spinner" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="auth-form__footer">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="auth-form__link">
          Create one
        </Link>
      </p>
    </>
  );
}

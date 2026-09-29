'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterFormData } from '@/lib/validators';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: '',
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
    const result = registerSchema.safeParse(formData);
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

    // Build display name
    const displayName = [formData.first_name, formData.last_name]
      .filter(Boolean)
      .join(' ');

    // Sign up with metadata (captured by the DB trigger)
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name || null,
          display_name: displayName,
          date_of_birth: formData.date_of_birth || null,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // Redirect to pending approval page
    router.push('/pending-approval');
    router.refresh();
  };

  return (
    <>
      <h2 className="auth-form__title">Create your account</h2>
      <p className="auth-form__subtitle">
        Start tracking every rupee with intention
      </p>

      {serverError && (
        <div className="auth-form__error-banner">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form__row">
          <div className="auth-form__field">
            <label htmlFor="first_name" className="auth-form__label">
              First Name <span className="auth-form__required">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              value={formData.first_name}
              onChange={handleChange}
              className={`auth-form__input ${errors.first_name ? 'auth-form__input--error' : ''}`}
              placeholder="Sunish"
            />
            {errors.first_name && (
              <p className="auth-form__error">{errors.first_name}</p>
            )}
          </div>

          <div className="auth-form__field">
            <label htmlFor="last_name" className="auth-form__label">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              value={formData.last_name}
              onChange={handleChange}
              className={`auth-form__input ${errors.last_name ? 'auth-form__input--error' : ''}`}
              placeholder="Kumar"
            />
            {errors.last_name && (
              <p className="auth-form__error">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="auth-form__field">
          <label htmlFor="email" className="auth-form__label">
            Email <span className="auth-form__required">*</span>
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
          <label htmlFor="date_of_birth" className="auth-form__label">
            Date of Birth
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            className={`auth-form__input ${errors.date_of_birth ? 'auth-form__input--error' : ''}`}
          />
          {errors.date_of_birth && (
            <p className="auth-form__error">{errors.date_of_birth}</p>
          )}
        </div>

        <div className="auth-form__field">
          <label htmlFor="password" className="auth-form__label">
            Password <span className="auth-form__required">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="auth-form__error">{errors.password}</p>
          )}
          <p className="auth-form__hint">
            At least 8 characters with uppercase, lowercase, and a number
          </p>
        </div>

        <div className="auth-form__field">
          <label htmlFor="confirm_password" className="auth-form__label">
            Confirm Password <span className="auth-form__required">*</span>
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            value={formData.confirm_password}
            onChange={handleChange}
            className={`auth-form__input ${errors.confirm_password ? 'auth-form__input--error' : ''}`}
            placeholder="••••••••"
          />
          {errors.confirm_password && (
            <p className="auth-form__error">{errors.confirm_password}</p>
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
            'Create Account'
          )}
        </button>
      </form>

      <p className="auth-form__footer">
        Already have an account?{' '}
        <Link href="/login" className="auth-form__link">
          Sign in
        </Link>
      </p>
    </>
  );
}

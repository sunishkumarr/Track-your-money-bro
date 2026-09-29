import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less'),
  last_name: z
    .string()
    .max(100, 'Last name must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirm_password: z.string(),
  date_of_birth: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Expense Schemas ────────────────────────────────────────

export const expenseSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  category_id: z.string().uuid('Please select a category'),
  description: z.string().min(1, 'Description is required'),
  expense_date: z.date(),
  transaction_type: z.enum(['expense', 'income', 'transfer']),
  payment_method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'wallet']).optional(),
  tag_names: z.array(z.string()).default([]),
  timeline_ids: z.array(z.string().uuid()).default([]),
  is_split: z.boolean().default(false),
  split_total: z.string().optional(),
  split_method: z.enum(['equal', 'custom']).optional(),
  participants: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    amount: z.string().min(1, 'Amount is required'),
  })).optional(),
});

// ─── Budget Schema ──────────────────────────────────────────

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  period_type: z.enum(['weekly', 'monthly', 'yearly', 'custom']),
  start_date: z.date(),
  end_date: z.date().optional(),
  category_id: z.string().uuid().optional(),
  timeline_id: z.string().uuid().optional(),
  rollover: z.boolean().default(false),
});

// ─── Timeline Schema ────────────────────────────────────────

export const timelineSchema = z.object({
  name: z.string().min(1, 'Timeline name is required'),
  description: z.string().optional().or(z.literal('')),
  start_date: z.date(),
  end_date: z.date().optional(),
  budget: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    'Budget must be a positive number'
  ),
});

// ─── Recurring Template Schema ──────────────────────────────

export const recurringSchema = z.object({
  category_id: z.string().uuid('Please select a category'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  description: z.string().min(1, 'Description is required'),
  payment_method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'wallet']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  next_due_date: z.date(),
  end_date: z.date().optional(),
});

// ─── Wishlist Schema ────────────────────────────────────────

export const wishlistSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional().or(z.literal('')),
  target_amount: z.string().min(1, 'Target amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Target amount must be a positive number'
  ),
  target_date: z.date().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category_id: z.string().uuid().optional(),
});

export const contributionSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  note: z.string().optional().or(z.literal('')),
});

// ─── Settings Schema ────────────────────────────────────────

const menuFeatureKeys = [
  'dashboard', 'expenses', 'analyze', 'plan', 'settings',
  'budgets', 'timelines', 'wishlist', 'recurring', 'settlements',
  'tags', 'export', 'search', 'profile',
] as const;

export const menuLayoutSchema = z.object({
  sidebar: z.array(z.enum(menuFeatureKeys)).min(1, 'Sidebar must have at least 1 item').max(6, 'Sidebar can have at most 6 items'),
  header: z.array(z.enum(menuFeatureKeys)),
  hamburger: z.array(z.enum(menuFeatureKeys)),
  expense_form_expanded_fields: z.array(z.string()),
});

export const settingsSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional().or(z.literal('')),
  timezone: z.string(),
  theme_preference: z.enum(['light', 'dark', 'system']),
  email_reminder_enabled: z.boolean(),
  email_reminder_time: z.string(),
  email_include_summary: z.boolean(),
  email_include_recurring: z.boolean(),
  email_include_budget: z.boolean(),
  menu_layout: menuLayoutSchema.optional(),
});


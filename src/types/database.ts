// Database types - mirrors the PostgreSQL schema exactly

export type TransactionType = 'expense' | 'income' | 'transfer';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'wallet';
export type ThemePreference = 'light' | 'dark' | 'system';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type WishlistPriority = 'high' | 'medium' | 'low';
export type WishlistStatus = 'active' | 'achieved' | 'purchased' | 'abandoned';
export type SplitMethod = 'equal' | 'custom';
export type AccountStatus = 'pending_approval' | 'active' | 'suspended' | 'rejected';
export type UserRole = 'user' | 'superadmin';

// Valid feature keys for menu customization
export type MenuFeatureKey =
  | 'dashboard'
  | 'expenses'
  | 'analyze'
  | 'plan'
  | 'settings'
  | 'budgets'
  | 'timelines'
  | 'wishlist'
  | 'recurring'
  | 'settlements'
  | 'tags'
  | 'export'
  | 'search'
  | 'profile';

export interface MenuLayout {
  /** Features shown as icons in the persistent sidebar (max 6) */
  sidebar: MenuFeatureKey[];
  /** Items shown in the top header bar */
  header: MenuFeatureKey[];
  /** Features accessible via the overflow/drawer menu */
  hamburger: MenuFeatureKey[];
  /** Which "More options" fields are expanded by default on the expense form */
  expense_form_expanded_fields: string[];
}

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  account_status: AccountStatus;
  role: UserRole;
  default_currency: string;
  timezone: string;
  theme_preference: ThemePreference;
  email_reminder_enabled: boolean;
  email_reminder_time: string;
  email_include_summary: boolean;
  email_include_recurring: boolean;
  email_include_budget: boolean;
  menu_layout: MenuLayout;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  parent_id: string | null;
  is_default: boolean;
  is_hidden: boolean;
  daily_rate_enabled: boolean;
  sort_order: number;
  created_at: string;
  // Virtual fields (populated by queries)
  subcategories?: Category[];
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  payment_method: PaymentMethod | null;
  expense_date: string;
  daily_rate: number | null;
  is_pending: boolean;
  recurring_id: string | null;
  created_at: string;
  updated_at: string;
  // Virtual fields (populated by joins)
  category?: Category;
  tags?: Tag[];
  timelines?: Timeline[];
  split?: ExpenseSplit;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface ExpenseTag {
  expense_id: string;
  tag_id: string;
}

export interface Timeline {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseTimeline {
  expense_id: string;
  timeline_id: string;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string | null;
  amount: number;
  period_type: BudgetPeriod;
  start_date: string;
  end_date: string | null;
  category_id: string | null;
  timeline_id: string | null;
  rollover: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields
  category?: Category;
  timeline?: Timeline;
  spent?: number;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  payment_method: PaymentMethod | null;
  frequency: RecurringFrequency;
  next_due_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields
  category?: Category;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  priority: WishlistPriority;
  category_id: string | null;
  status: WishlistStatus;
  converted_expense_id: string | null;
  created_at: string;
  updated_at: string;
  // Virtual fields
  category?: Category;
  contributions?: SavingsContribution[];
}

export interface SavingsContribution {
  id: string;
  wishlist_item_id: string;
  amount: number;
  note: string | null;
  contributed_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  total_amount: number;
  user_share: number;
  split_method: SplitMethod;
  num_participants: number;
  created_at: string;
  // Virtual fields
  participants?: SplitParticipant[];
}

export interface SplitParticipant {
  id: string;
  split_id: string;
  name: string;
  amount: number;
  is_settled: boolean;
  settled_at: string | null;
  created_at: string;
}

// Database table name type for Supabase queries
export type TableName =
  | 'users'
  | 'categories'
  | 'expenses'
  | 'tags'
  | 'expense_tags'
  | 'timelines'
  | 'expense_timelines'
  | 'budgets'
  | 'recurring_templates'
  | 'wishlist_items'
  | 'savings_contributions'
  | 'expense_splits'
  | 'split_participants';

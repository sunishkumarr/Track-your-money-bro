// App-level types: forms, filters, charts, UI state

import type {
  TransactionType,
  PaymentMethod,
  BudgetPeriod,
  RecurringFrequency,
  WishlistPriority,
  SplitMethod,
} from './database';

// ─── Expense Form ───────────────────────────────────────────

export interface ExpenseFormData {
  amount: string;
  category_id: string;
  subcategory_id?: string;
  description: string;
  expense_date: Date;
  transaction_type: TransactionType;
  payment_method?: PaymentMethod;
  tag_names: string[];
  timeline_ids: string[];
  // Split fields
  is_split: boolean;
  split_total?: string;
  split_method?: SplitMethod;
  participants?: ParticipantFormData[];
}

export interface ParticipantFormData {
  name: string;
  amount: string;
}

// ─── Filters ────────────────────────────────────────────────

export interface ExpenseFilters {
  dateRange: DateRange;
  categories: string[];
  subcategories: string[];
  tags: string[];
  timelines: string[];
  paymentMethods: PaymentMethod[];
  transactionTypes: TransactionType[];
  amountMin?: number;
  amountMax?: number;
  searchQuery: string;
  isSplit?: boolean;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export type SortField = 'amount' | 'expense_date' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'custom';

// ─── Budget Form ────────────────────────────────────────────

export interface BudgetFormData {
  name: string;
  amount: string;
  period_type: BudgetPeriod;
  start_date: Date;
  end_date?: Date;
  category_id?: string;
  timeline_id?: string;
  rollover: boolean;
}

// ─── Timeline Form ──────────────────────────────────────────

export interface TimelineFormData {
  name: string;
  description: string;
  start_date: Date;
  end_date?: Date;
  budget?: string;
}

// ─── Recurring Form ─────────────────────────────────────────

export interface RecurringFormData {
  category_id: string;
  amount: string;
  description: string;
  payment_method?: PaymentMethod;
  frequency: RecurringFrequency;
  next_due_date: Date;
  end_date?: Date;
}

// ─── Wishlist Form ──────────────────────────────────────────

export interface WishlistFormData {
  name: string;
  description: string;
  target_amount: string;
  target_date?: Date;
  priority: WishlistPriority;
  category_id?: string;
}

export interface ContributionFormData {
  amount: string;
  note: string;
}

// ─── Chart Data ─────────────────────────────────────────────

export interface CategoryBreakdown {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  label: string;
  amount: number;
  income?: number;
  expense?: number;
}

export interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface TopExpense {
  id: string;
  description: string;
  amount: number;
  category_name: string;
  category_icon: string;
  date: string;
}

export interface SummaryStats {
  totalExpenses: number;
  totalIncome: number;
  netCashFlow: number;
  savingsRate: number;
  transactionCount: number;
  averageExpense: number;
  dailyAverage: number;
}

// ─── Settings ───────────────────────────────────────────────

export interface UserSettings {
  display_name: string;
  timezone: string;
  theme_preference: 'light' | 'dark' | 'system';
  email_reminder_enabled: boolean;
  email_reminder_time: string;
  email_include_summary: boolean;
  email_include_recurring: boolean;
  email_include_budget: boolean;
}

// ─── Settlement View ────────────────────────────────────────

export interface SettlementSummary {
  participant_name: string;
  total_owed: number;
  expenses: {
    expense_id: string;
    description: string;
    participant_id: string;
    amount: number;
    date: string;
    is_settled: boolean;
  }[];
}

// ─── Navigation ─────────────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

// ─── Budget Status ──────────────────────────────────────────

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

export interface BudgetProgress {
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

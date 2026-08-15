import { TransactionType } from '../types';

export const CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Subscriptions',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Insurance',
  'Income',
  'Transfers',
  'Other'
] as const;

export type StandardCategory = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<StandardCategory, string> = {
  Housing: '#3b82f6', // Blue
  'Food & Dining': '#f59e0b', // Amber
  Groceries: '#10b981', // Emerald
  Transportation: '#8b5cf6', // Purple
  Shopping: '#ec4899', // Pink
  Entertainment: '#06b6d4', // Cyan
  Subscriptions: '#6366f1', // Indigo
  Utilities: '#64748b', // Slate
  Healthcare: '#ef4444', // Red
  Education: '#0d9488', // Teal
  Travel: '#f97316', // Orange
  'Personal Care': '#d946ef', // Fuchsia
  Insurance: '#475569', // Dark Slate
  Income: '#22c55e', // Green
  Transfers: '#94a3b8', // Light Gray
  Other: '#6b7280' // Gray
};

/**
 * Maps Plaid raw category hierarchy or string array to our internal category list.
 */
export function normalizeCategory(plaidCategories?: string[] | null, description: string = ''): StandardCategory {
  const descLower = description.toLowerCase();
  
  // Check for income/payroll keywords first
  if (
    descLower.includes('payroll') ||
    descLower.includes('direct dep') ||
    descLower.includes('salary') ||
    descLower.includes('stipend') ||
    descLower.includes('refund') ||
    descLower.includes('dividend')
  ) {
    return 'Income';
  }

  // Check for transfer keywords
  if (
    descLower.includes('transfer') ||
    descLower.includes('chase credit card pmt') ||
    descLower.includes('autopay') ||
    descLower.includes('payment to') ||
    descLower.includes('venmo cashout') ||
    descLower.includes('zelle transfer')
  ) {
    return 'Transfers';
  }

  if (!plaidCategories || plaidCategories.length === 0) {
    // Keyword heuristics based on merchant description
    if (descLower.includes('uber') || descLower.includes('lyft') || descLower.includes('gas') || descLower.includes('chevron') || descLower.includes('shell')) {
      return 'Transportation';
    }
    if (descLower.includes('trader joe') || descLower.includes('whole foods') || descLower.includes('safeway') || descLower.includes('kroger') || descLower.includes('target')) {
      return 'Groceries';
    }
    if (descLower.includes('starbucks') || descLower.includes('doordash') || descLower.includes('mcdonald') || descLower.includes('restaurant') || descLower.includes('cafe')) {
      return 'Food & Dining';
    }
    if (descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('apple.com') || descLower.includes('hulu') || descLower.includes('hbo')) {
      return 'Subscriptions';
    }
    if (descLower.includes('amazon') || descLower.includes('nike') || descLower.includes('zara') || descLower.includes('sephora')) {
      return 'Shopping';
    }
    if (descLower.includes('pg&e') || descLower.includes('electric') || descLower.includes('water') || descLower.includes('att') || descLower.includes('verizon')) {
      return 'Utilities';
    }
    if (descLower.includes('rent') || descLower.includes('mortgage') || descLower.includes('lease')) {
      return 'Housing';
    }
    return 'Other';
  }

  const primary = plaidCategories[0]?.toLowerCase() || '';
  const secondary = plaidCategories[1]?.toLowerCase() || '';

  if (primary.includes('income') || primary.includes('payroll') || primary.includes('bank fees refund')) {
    return 'Income';
  }

  if (primary.includes('transfer') || secondary.includes('credit card payment') || secondary.includes('internal account transfer')) {
    return 'Transfers';
  }

  if (primary.includes('food and drink') || primary.includes('restaurants') || secondary.includes('fast food')) {
    if (secondary.includes('supermarkets') || secondary.includes('groceries')) {
      return 'Groceries';
    }
    return 'Food & Dining';
  }

  if (primary.includes('shops') || primary.includes('shopping')) {
    if (secondary.includes('supermarket') || secondary.includes('groceries')) {
      return 'Groceries';
    }
    return 'Shopping';
  }

  if (primary.includes('travel') || secondary.includes('airlines') || secondary.includes('hotels')) {
    return 'Travel';
  }

  if (primary.includes('recreation') || primary.includes('entertainment') || secondary.includes('movies')) {
    return 'Entertainment';
  }

  if (primary.includes('service') || secondary.includes('cable') || secondary.includes('telecommunication') || secondary.includes('utilities')) {
    return 'Utilities';
  }

  if (primary.includes('healthcare') || secondary.includes('medical') || secondary.includes('pharmacy')) {
    return 'Healthcare';
  }

  if (primary.includes('community') || secondary.includes('education') || secondary.includes('tuition')) {
    return 'Education';
  }

  if (primary.includes('payment') && secondary.includes('rent')) {
    return 'Housing';
  }

  return 'Other';
}

/**
 * Determines transaction type: Income, Expense, or Transfer
 */
export function determineTransactionType(category: string, amount: number): TransactionType {
  if (category === 'Income' || amount < 0) {
    return 'income';
  }
  if (category === 'Transfers') {
    return 'transfer';
  }
  return 'expense';
}

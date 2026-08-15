import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';
import { FinancialAccount, Institution, Transaction } from '../types';
import { normalizeCategory, determineTransactionType } from './categories';

// Initialize real Plaid API client if credentials exist
let plaidClient: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi | null {
  if (plaidClient) return plaidClient;

  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = (process.env.PLAID_ENV || 'sandbox').toLowerCase();

  if (!clientId || !secret) {
    return null; // Will fallback to integrated simulator
  }

  const plaidEnv = env === 'production' 
    ? PlaidEnvironments.production 
    : env === 'development' 
    ? PlaidEnvironments.development 
    : PlaidEnvironments.sandbox;

  const configuration = new Configuration({
    basePath: plaidEnv,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
    },
  });

  plaidClient = new PlaidApi(configuration);
  return plaidClient;
}

export const INST_PRESETS = [
  { id: 'ins_1', name: 'Chase', logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80', primaryColor: '#117aca' },
  { id: 'ins_2', name: 'Bank of America', logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80', primaryColor: '#e31837' },
  { id: 'ins_3', name: 'Fidelity Investments', logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80', primaryColor: '#006633' },
  { id: 'ins_4', name: 'Wells Fargo', logoUrl: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=120&auto=format&fit=crop&q=80', primaryColor: '#cd1409' },
  { id: 'ins_5', name: 'American Express', logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80', primaryColor: '#006fcf' }
];

export async function createLinkTokenServer(userId: string): Promise<string> {
  const client = getPlaidClient();
  if (client) {
    try {
      const response = await client.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Personal Finance Dashboard',
        products: [Products.Transactions, Products.Auth],
        country_codes: [CountryCode.Us],
        language: 'en',
      });
      return response.data.link_token;
    } catch (err: any) {
      console.warn('Real Plaid linkTokenCreate failed, using sandbox simulator:', err?.response?.data || err.message);
    }
  }

  // Fallback simulator token
  return `link-sandbox-${userId}-${Date.now()}`;
}

export async function exchangePublicTokenServer(
  publicToken: string,
  institutionIdPreset?: string
): Promise<{ accessToken: string; itemId: string; institution: { id: string; name: string; logoUrl?: string; color?: string } }> {
  const client = getPlaidClient();

  if (client && !publicToken.startsWith('public-sandbox-sim-')) {
    try {
      const response = await client.itemPublicTokenExchange({ public_token: publicToken });
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Get item info for institution name
      const itemResponse = await client.itemGet({ access_token: accessToken });
      const instId = itemResponse.data.item.institution_id || 'ins_1';
      
      let instName = 'Connected Bank';
      if (instId) {
        try {
          const instRes = await client.institutionsGetById({
            institution_id: instId,
            country_codes: [CountryCode.Us],
          });
          instName = instRes.data.institution.name;
        } catch {
          instName = 'Connected Bank';
        }
      }

      return {
        accessToken,
        itemId,
        institution: {
          id: instId,
          name: instName,
        },
      };
    } catch (err: any) {
      console.warn('Real Plaid token exchange error, defaulting to simulator:', err?.response?.data || err.message);
    }
  }

  // Simulator Exchange
  const preset = INST_PRESETS.find(p => p.id === institutionIdPreset) || INST_PRESETS[0];
  const accessToken = `access-sandbox-${preset.id}-${Date.now()}`;
  const itemId = `item-sandbox-${preset.id}-${Date.now()}`;

  return {
    accessToken,
    itemId,
    institution: {
      id: preset.id,
      name: preset.name,
      logoUrl: preset.logoUrl,
      color: preset.primaryColor,
    },
  };
}

/**
 * Sync accounts for a connected institution.
 */
export async function syncAccountsServer(
  accessToken: string,
  institutionDbId: string,
  userId: string,
  institutionPresetId?: string
): Promise<FinancialAccount[]> {
  const client = getPlaidClient();

  if (client && accessToken.startsWith('access-sandbox-plaid-real-')) {
    try {
      const res = await client.accountsGet({ access_token: accessToken });
      return res.data.accounts.map(acc => ({
        id: `acc_${acc.account_id}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: acc.account_id,
        name: acc.name,
        officialName: acc.official_name || acc.name,
        type: (acc.type as any) || 'depository',
        subtype: acc.subtype || undefined,
        mask: acc.mask || '4321',
        currentBalance: acc.balances.current || 0,
        availableBalance: acc.balances.available || acc.balances.current || 0,
        isoCurrencyCode: acc.balances.iso_currency_code || 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('Real Plaid accountsGet failed, using simulated accounts:', err.message);
    }
  }

  // Generate realistic simulated accounts based on institution preset
  const preset = INST_PRESETS.find(p => p.id === institutionPresetId) || INST_PRESETS[0];
  const now = new Date().toISOString();

  if (preset.name === 'Chase') {
    return [
      {
        id: `acc_chase_chk_${institutionDbId}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: `plaid_acc_chase_chk_${institutionDbId}`,
        name: 'Total Checking',
        officialName: 'Chase Total Checking',
        type: 'depository',
        subtype: 'checking',
        mask: '4821',
        currentBalance: 4250.75,
        availableBalance: 4250.75,
        isoCurrencyCode: 'USD',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `acc_chase_sav_${institutionDbId}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: `plaid_acc_chase_sav_${institutionDbId}`,
        name: 'Savings Account',
        officialName: 'Chase Savings Plus',
        type: 'depository',
        subtype: 'savings',
        mask: '9012',
        currentBalance: 12450.00,
        availableBalance: 12450.00,
        isoCurrencyCode: 'USD',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `acc_chase_cc_${institutionDbId}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: `plaid_acc_chase_cc_${institutionDbId}`,
        name: 'Sapphire Preferred',
        officialName: 'Chase Sapphire Preferred Credit Card',
        type: 'credit',
        subtype: 'credit card',
        mask: '3145',
        currentBalance: 840.50,
        availableBalance: 9159.50,
        isoCurrencyCode: 'USD',
        createdAt: now,
        updatedAt: now,
      }
    ];
  } else if (preset.name === 'Fidelity Investments') {
    return [
      {
        id: `acc_fid_inv_${institutionDbId}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: `plaid_acc_fid_inv_${institutionDbId}`,
        name: 'Individual Brokerage',
        officialName: 'Fidelity Individual Account',
        type: 'investment',
        subtype: 'brokerage',
        mask: '7721',
        currentBalance: 28940.10,
        availableBalance: 28940.10,
        isoCurrencyCode: 'USD',
        createdAt: now,
        updatedAt: now,
      }
    ];
  } else {
    return [
      {
        id: `acc_gen_chk_${institutionDbId}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: `plaid_acc_gen_chk_${institutionDbId}`,
        name: `${preset.name} Checking`,
        officialName: `${preset.name} Advantage Checking`,
        type: 'depository',
        subtype: 'checking',
        mask: '6543',
        currentBalance: 3100.20,
        availableBalance: 3100.20,
        isoCurrencyCode: 'USD',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `acc_gen_cc_${institutionDbId}`,
        institutionId: institutionDbId,
        userId,
        plaidAccountId: `plaid_acc_gen_cc_${institutionDbId}`,
        name: `${preset.name} Cash Rewards`,
        officialName: `${preset.name} Rewards Mastercard`,
        type: 'credit',
        subtype: 'credit card',
        mask: '8812',
        currentBalance: 420.00,
        availableBalance: 4580.00,
        isoCurrencyCode: 'USD',
        createdAt: now,
        updatedAt: now,
      }
    ];
  }
}

/**
 * Sync transactions for a connected institution.
 */
export async function syncTransactionsServer(
  accessToken: string,
  accounts: FinancialAccount[],
  userId: string,
  cursor?: string
): Promise<{ added: Transaction[]; updated: Transaction[]; nextCursor: string }> {
  const client = getPlaidClient();

  if (client && accessToken.startsWith('access-sandbox-plaid-real-')) {
    try {
      const response = await client.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        count: 100,
      });

      const added: Transaction[] = response.data.added.map(t => {
        const matchingAccount = accounts.find(a => a.plaidAccountId === t.account_id) || accounts[0];
        const rawPlaidCategory = t.category || [];
        const normCat = normalizeCategory(rawPlaidCategory, t.merchant_name || t.name);
        const amount = t.amount;
        const normAmount = Math.abs(amount);
        const type = determineTransactionType(normCat, amount);

        return {
          id: `tx_${t.transaction_id}`,
          userId,
          accountId: matchingAccount?.id || accounts[0]?.id || '',
          plaidTransactionId: t.transaction_id,
          merchantName: t.merchant_name || t.name || 'Unknown Merchant',
          description: t.name || 'Plaid Sync Transaction',
          amount,
          normalizedAmount: normAmount,
          type,
          currency: t.iso_currency_code || 'USD',
          date: t.date,
          pending: t.pending || false,
          category: normCat,
          plaidCategory: rawPlaidCategory,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        added,
        updated: [],
        nextCursor: response.data.next_cursor || `cursor_${Date.now()}`,
      };
    } catch (err: any) {
      console.warn('Real Plaid transactionsSync error, falling back to realistic simulation:', err.message);
    }
  }

  // Realistic Simulation Generator with current dates relative to today
  const today = new Date();
  const formatDaysAgo = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const sampleTxDefs = [
    { merchant: 'TechCorp Salary', desc: 'Direct Deposit Payroll', amount: -4500.00, cat: 'Income', daysAgo: 1, accountIndex: 0 },
    { merchant: 'Trader Joe\'s', desc: 'Groceries & Household', amount: 142.30, cat: 'Groceries', daysAgo: 2, accountIndex: 0 },
    { merchant: 'Starbucks', desc: 'Coffee & Breakfast', amount: 8.75, cat: 'Food & Dining', daysAgo: 2, accountIndex: 0 },
    { merchant: 'Blue Bottle Coffee', desc: 'Espresso Bar', amount: 12.50, cat: 'Food & Dining', daysAgo: 3, accountIndex: 0 },
    { merchant: 'Chevron', desc: 'Fuel Gasoline', amount: 52.40, cat: 'Transportation', daysAgo: 4, accountIndex: 0 },
    { merchant: 'Uber Trip', desc: 'Ride Share San Francisco', amount: 24.15, cat: 'Transportation', daysAgo: 5, accountIndex: 0 },
    { merchant: 'Netflix', desc: 'Monthly Premium Subscription', amount: 19.99, cat: 'Subscriptions', daysAgo: 6, accountIndex: 2 },
    { merchant: 'Spotify', desc: 'Family Plan', amount: 16.99, cat: 'Subscriptions', daysAgo: 7, accountIndex: 2 },
    { merchant: 'Amazon.com', desc: 'Electronics & Home Accessories', amount: 118.50, cat: 'Shopping', daysAgo: 8, accountIndex: 2 },
    { merchant: 'Target', desc: 'Home Goods & Personal Care', amount: 64.20, cat: 'Shopping', daysAgo: 10, accountIndex: 2 },
    { merchant: 'PG&E Electric', desc: 'Monthly Utility Bill', amount: 135.00, cat: 'Utilities', daysAgo: 12, accountIndex: 0 },
    { merchant: 'Apt Rental Mgmt', desc: 'Monthly Apartment Rent', amount: 2100.00, cat: 'Housing', daysAgo: 14, accountIndex: 0 },
    { merchant: 'Whole Foods Market', desc: 'Organic Groceries', amount: 185.90, cat: 'Groceries', daysAgo: 15, accountIndex: 0 },
    { merchant: 'Equinox Gym', desc: 'Fitness Membership', amount: 195.00, cat: 'Healthcare', daysAgo: 17, accountIndex: 2 },
    { merchant: 'Sweetgreen', desc: 'Lunch Salad Bar', amount: 18.25, cat: 'Food & Dining', daysAgo: 18, accountIndex: 0 },
    { merchant: 'Chipotle', desc: 'Mexican Grill', amount: 16.40, cat: 'Food & Dining', daysAgo: 19, accountIndex: 0 },
    { merchant: 'Chase Credit Card AutoPay', desc: 'Transfer Payment', amount: 840.50, cat: 'Transfers', daysAgo: 20, accountIndex: 0 },
    { merchant: 'Freelance Design Client', desc: 'Invoice Payment #104', amount: -1250.00, cat: 'Income', daysAgo: 22, accountIndex: 0 },
    { merchant: 'Delta Air Lines', desc: 'Flight Booking Flight #421', amount: 380.00, cat: 'Travel', daysAgo: 25, accountIndex: 2 },
    { merchant: 'Airbnb', desc: 'Weekend Getaway Rental', amount: 450.00, cat: 'Travel', daysAgo: 28, accountIndex: 2 },
    { merchant: 'AMC Theatres', desc: 'Movie Tickets & Snacks', amount: 32.50, cat: 'Entertainment', daysAgo: 31, accountIndex: 2 },
  ];

  const added: Transaction[] = sampleTxDefs.map((def, idx) => {
    const acc = accounts[def.accountIndex % accounts.length] || accounts[0];
    const txDate = formatDaysAgo(def.daysAgo);
    const plaidTxId = `plaid_sim_tx_${acc.id}_${idx}_${txDate}`;
    const normAmount = Math.abs(def.amount);
    const type = determineTransactionType(def.cat, def.amount);

    return {
      id: `tx_${plaidTxId}`,
      userId,
      accountId: acc.id,
      plaidTransactionId: plaidTxId,
      merchantName: def.merchant,
      description: def.desc,
      amount: def.amount,
      normalizedAmount: normAmount,
      type,
      currency: 'USD',
      date: txDate,
      pending: def.daysAgo === 1 && def.amount > 0, // Pending direct dep or recent
      category: def.cat,
      plaidCategory: [def.cat],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    added,
    updated: [],
    nextCursor: `sim_cursor_${Date.now()}`,
  };
}

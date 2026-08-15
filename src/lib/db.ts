import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { User, Institution, FinancialAccount, Transaction, Budget, SyncState } from '../types';
import { decryptAccessToken, encryptAccessToken } from './encryption';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  institutions: Institution[];
  financialAccounts: FinancialAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  syncStates: SyncState[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: [],
      institutions: [],
      financialAccounts: [],
      transactions: [],
      budgets: [],
      syncStates: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

export function readDb(): DatabaseSchema {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {
      users: [],
      institutions: [],
      financialAccounts: [],
      transactions: [],
      budgets: [],
      syncStates: [],
    };
  }
}

export function writeDb(data: DatabaseSchema): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// ==================== USER OPERATIONS ====================

export async function createUser(email: string, passwordPlain: string, name: string): Promise<User> {
  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);
  const now = new Date().toISOString();

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(newUser);
  writeDb(db);

  const { passwordHash: _, ...publicUser } = newUser;
  return publicUser;
}

export async function verifyUserCredentials(email: string, passwordPlain: string): Promise<User | null> {
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) return null;

  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

export function getUserById(id: string): User | null {
  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (!user) return null;
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

// ==================== INSTITUTION & ACCOUNT OPERATIONS ====================

export function getUserInstitutions(userId: string): Institution[] {
  const db = readDb();
  return db.institutions.filter(i => i.userId === userId);
}

export function saveInstitution(
  userId: string,
  plaidInstitutionId: string,
  name: string,
  plainAccessToken: string,
  status: 'active' | 'requires_reauth' | 'error' = 'active'
): Institution {
  const db = readDb();
  const encrypted = encryptAccessToken(plainAccessToken);
  const now = new Date().toISOString();

  const existing = db.institutions.find(i => i.userId === userId && i.plaidInstitutionId === plaidInstitutionId);
  
  if (existing) {
    existing.encryptedAccessToken = encrypted;
    existing.status = status;
    existing.updatedAt = now;
    writeDb(db);
    return existing;
  }

  const newInst: Institution = {
    id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    plaidInstitutionId,
    name,
    encryptedAccessToken: encrypted,
    status,
    createdAt: now,
    updatedAt: now,
  };

  db.institutions.push(newInst);
  writeDb(db);
  return newInst;
}

export function getDecryptedAccessTokenForInst(institutionId: string, userId: string): string | null {
  const db = readDb();
  const inst = db.institutions.find(i => i.id === institutionId && i.userId === userId);
  if (!inst) return null;
  return decryptAccessToken(inst.encryptedAccessToken);
}

export function removeInstitution(institutionId: string, userId: string): boolean {
  const db = readDb();
  const instIndex = db.institutions.findIndex(i => i.id === institutionId && i.userId === userId);
  if (instIndex === -1) return false;

  db.institutions.splice(instIndex, 1);
  
  // Also remove associated accounts and transactions safely
  const accountIdsToRemove = db.financialAccounts
    .filter(a => a.institutionId === institutionId && a.userId === userId)
    .map(a => a.id);

  db.financialAccounts = db.financialAccounts.filter(a => !(a.institutionId === institutionId && a.userId === userId));
  db.transactions = db.transactions.filter(t => !accountIdsToRemove.includes(t.accountId) && t.userId !== userId);
  db.syncStates = db.syncStates.filter(s => s.institutionId !== institutionId);

  writeDb(db);
  return true;
}

export function getUserAccounts(userId: string): FinancialAccount[] {
  const db = readDb();
  return db.financialAccounts.filter(a => a.userId === userId);
}

export function saveUserAccounts(userId: string, accounts: FinancialAccount[]): void {
  const db = readDb();
  
  for (const acc of accounts) {
    const existingIndex = db.financialAccounts.findIndex(a => a.userId === userId && a.plaidAccountId === acc.plaidAccountId);
    if (existingIndex !== -1) {
      db.financialAccounts[existingIndex] = {
        ...db.financialAccounts[existingIndex],
        ...acc,
        updatedAt: new Date().toISOString(),
      };
    } else {
      db.financialAccounts.push(acc);
    }
  }

  writeDb(db);
}

// ==================== TRANSACTION OPERATIONS ====================

export function getUserTransactions(
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    accountId?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'amount' | 'merchantName';
    sortOrder?: 'asc' | 'desc';
  }
): { transactions: Transaction[]; totalCount: number } {
  const db = readDb();
  let txs = db.transactions.filter(t => t.userId === userId);

  if (options?.startDate) {
    txs = txs.filter(t => t.date >= options.startDate!);
  }
  if (options?.endDate) {
    txs = txs.filter(t => t.date <= options.endDate!);
  }
  if (options?.category && options.category !== 'ALL') {
    txs = txs.filter(t => (t.categoryOverride || t.category) === options.category);
  }
  if (options?.accountId && options.accountId !== 'ALL') {
    txs = txs.filter(t => t.accountId === options.accountId);
  }
  if (options?.type && options.type !== 'ALL') {
    txs = txs.filter(t => t.type === options.type);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    txs = txs.filter(t => 
      t.merchantName.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q)
    );
  }

  const sortBy = options?.sortBy || 'date';
  const sortOrder = options?.sortOrder || 'desc';

  txs.sort((a, b) => {
    let valA: any = a[sortBy];
    let valB: any = b[sortBy];

    if (sortBy === 'amount') {
      valA = Math.abs(a.amount);
      valB = Math.abs(b.amount);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalCount = txs.length;

  if (options?.offset !== undefined && options?.limit) {
    txs = txs.slice(options.offset, options.offset + options.limit);
  } else if (options?.limit) {
    txs = txs.slice(0, options.limit);
  }

  return { transactions: txs, totalCount };
}

/**
 * Idempotent transaction sync save.
 * Preserves user manual category overrides!
 */
export function syncSaveTransactions(userId: string, newTxs: Transaction[]): { addedCount: number; updatedCount: number } {
  const db = readDb();
  let addedCount = 0;
  let updatedCount = 0;

  for (const tx of newTxs) {
    // Check by plaidTransactionId or composite key
    const existingIndex = db.transactions.findIndex(t => 
      t.userId === userId && 
      ((tx.plaidTransactionId && t.plaidTransactionId === tx.plaidTransactionId) ||
       (t.accountId === tx.accountId && t.date === tx.date && t.merchantName === tx.merchantName && t.amount === tx.amount))
    );

    if (existingIndex !== -1) {
      const existing = db.transactions[existingIndex];
      db.transactions[existingIndex] = {
        ...tx,
        id: existing.id,
        categoryOverride: existing.categoryOverride, // PRESERVE USER OVERRIDE!
        notes: existing.notes || tx.notes,
        updatedAt: new Date().toISOString(),
      };
      updatedCount++;
    } else {
      db.transactions.push(tx);
      addedCount++;
    }
  }

  writeDb(db);
  return { addedCount, updatedCount };
}

export function updateTransactionCategory(userId: string, transactionId: string, newCategory: string, notes?: string): Transaction | null {
  const db = readDb();
  const tx = db.transactions.find(t => t.id === transactionId && t.userId === userId);
  if (!tx) return null;

  tx.categoryOverride = newCategory;
  if (notes !== undefined) {
    tx.notes = notes;
  }
  tx.updatedAt = new Date().toISOString();

  writeDb(db);
  return tx;
}

export function addManualTransaction(userId: string, txData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Transaction {
  const db = readDb();
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...txData,
    id: `tx_manual_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  db.transactions.push(newTx);
  writeDb(db);
  return newTx;
}

// ==================== BUDGET OPERATIONS ====================

export function getUserBudgets(userId: string, period?: string): Budget[] {
  const db = readDb();
  let budgets = db.budgets.filter(b => b.userId === userId);
  if (period) {
    budgets = budgets.filter(b => b.period === period);
  }
  return budgets;
}

export function saveBudget(userId: string, category: string, monthlyLimit: number, period: string): Budget {
  const db = readDb();
  const now = new Date().toISOString();

  const existingIndex = db.budgets.findIndex(b => b.userId === userId && b.category === category && b.period === period);

  if (existingIndex !== -1) {
    db.budgets[existingIndex].monthlyLimit = monthlyLimit;
    db.budgets[existingIndex].updatedAt = now;
    writeDb(db);
    return db.budgets[existingIndex];
  }

  const newBudget: Budget = {
    id: `bdg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    category,
    monthlyLimit,
    period,
    createdAt: now,
    updatedAt: now,
  };

  db.budgets.push(newBudget);
  writeDb(db);
  return newBudget;
}

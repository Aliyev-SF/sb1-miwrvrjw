import { Transaction, BudgetSummary, Category, TransactionCategory } from '@/types';

// Mock data - in a real app, this would be stored in a database
let transactions: Transaction[] = [
  {
    id: '1',
    title: 'Salary',
    amount: 5000,
    type: 'income',
    category: 'Income',
    date: new Date('2023-05-01'),
  },
  {
    id: '2',
    title: 'Rent',
    amount: 1500,
    type: 'expense',
    category: 'Housing',
    date: new Date('2023-05-02'),
  },
  {
    id: '3',
    title: 'Groceries',
    amount: 200,
    type: 'expense',
    category: 'Food',
    date: new Date('2023-05-03'),
  },
  {
    id: '4',
    title: 'Dining Out',
    amount: 75,
    type: 'expense',
    category: 'Food',
    date: new Date('2023-05-04'),
  },
  {
    id: '5',
    title: 'Movie Tickets',
    amount: 30,
    type: 'expense',
    category: 'Entertainment',
    date: new Date('2023-05-05'),
  },
];

let categories: Category[] = [
  {
    id: '1',
    name: 'Rent',
    limit: 1500,
    spent: 1500,
    budgetType: 'needs',
  },
  {
    id: '2',
    name: 'Groceries',
    limit: 400,
    spent: 200,
    budgetType: 'needs',
  },
  {
    id: '3',
    name: 'Utilities',
    limit: 200,
    spent: 150,
    budgetType: 'needs',
  },
  {
    id: '4',
    name: 'Dining Out',
    limit: 200,
    spent: 75,
    budgetType: 'wants',
  },
  {
    id: '5',
    name: 'Entertainment',
    limit: 100,
    spent: 30,
    budgetType: 'wants',
  },
  {
    id: '6',
    name: 'Emergency Fund',
    limit: 500,
    spent: 500,
    budgetType: 'savings',
  },
  {
    id: '7',
    name: 'Investments',
    limit: 500,
    spent: 500,
    budgetType: 'savings',
  },
];

// Get all transactions
export const getTransactions = (): Transaction[] => {
  return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Get recent transactions (last 5)
export const getRecentTransactions = (): Transaction[] => {
  return getTransactions().slice(0, 5);
};

// Add a new transaction
export const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): Transaction => {
  const newTransaction: Transaction = {
    id: (transactions.length + 1).toString(),
    date: new Date(),
    ...transaction,
  };
  
  transactions = [newTransaction, ...transactions];
  return newTransaction;
};

// Get budget summary
export const getBudgetSummary = (): BudgetSummary => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;
  
  // 50-30-20 rule
  const needsLimit = income * 0.5;
  const wantsLimit = income * 0.3;
  const savingsLimit = income * 0.2;
  
  const needsSpent = categories
    .filter(c => c.budgetType === 'needs')
    .reduce((sum, c) => sum + c.spent, 0);
  
  const wantsSpent = categories
    .filter(c => c.budgetType === 'wants')
    .reduce((sum, c) => sum + c.spent, 0);
  
  const savingsSpent = categories
    .filter(c => c.budgetType === 'savings')
    .reduce((sum, c) => sum + c.spent, 0);
  
  return {
    income,
    expenses,
    balance,
    needs: {
      spent: needsSpent,
      limit: needsLimit,
    },
    wants: {
      spent: wantsSpent,
      limit: wantsLimit,
    },
    savings: {
      spent: savingsSpent,
      limit: savingsLimit,
    },
  };
};

// Get all categories
export const getCategories = (): Category[] => {
  return [...categories];
};

// Add a new category
export const addCategory = (category: Omit<Category, 'id'>): Category => {
  const newCategory: Category = {
    id: (categories.length + 1).toString(),
    ...category,
  };
  
  categories = [...categories, newCategory];
  return newCategory;
};

// Get transaction categories
export const getTransactionCategories = (): TransactionCategory[] => {
  return categories.map(c => ({
    id: c.id,
    name: c.name,
    budgetType: c.budgetType,
  }));
};
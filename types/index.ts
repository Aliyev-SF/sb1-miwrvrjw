// Budget Types
export type BudgetType = 'needs' | 'wants' | 'savings';

export interface BudgetCategory {
  spent: number;
  limit: number;
}

export interface BudgetSummary {
  income: number;
  expenses: number;
  balance: number;
  needs: BudgetCategory;
  wants: BudgetCategory;
  savings: BudgetCategory;
}

export interface Category {
  id: string;
  name: string;
  limit: number;
  spent: number;
  budgetType: BudgetType;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
}

export interface TransactionCategory {
  id: string;
  name: string;
  budgetType: BudgetType;
}
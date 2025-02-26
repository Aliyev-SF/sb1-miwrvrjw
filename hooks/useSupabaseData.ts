import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Transaction, Category, BudgetSummary } from '@/types';
import { Database } from '@/types/supabase';

type SupabaseTransaction = Database['public']['Tables']['transactions']['Row'];
type SupabaseCategory = Database['public']['Tables']['categories']['Row'];
type SupabaseBudgetSettings = Database['public']['Tables']['budget_settings']['Row'];

export function useTransactions() {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            categories(name, budget_type)
          `)
          .eq('user_id', session.user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        const formattedTransactions: Transaction[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          amount: item.amount,
          type: item.type,
          category: item.categories?.name || 'Uncategorized',
          date: new Date(item.date),
        }));

        setTransactions(formattedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!session) return null;

    try {
      // Find category ID if category name is provided
      let categoryId = null;
      if (transaction.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', transaction.category)
          .eq('user_id', session.user.id)
          .single();
        
        if (categoryData) {
          categoryId = categoryData.id;
        }
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: session.user.id,
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          category_id: categoryId,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        title: data.title,
        amount: data.amount,
        type: data.type,
        category: transaction.category,
        date: new Date(data.date),
      };

      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      return null;
    }
  };

  return { transactions, isLoading, error, addTransaction };
}

export function useCategories() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        
        // Get categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', session.user.id);

        if (categoriesError) throw categoriesError;

        // Get spent amount for each category
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('category_id, amount, type')
          .eq('user_id', session.user.id)
          .eq('type', 'expense');

        if (transactionsError) throw transactionsError;

        // Calculate spent amount for each category
        const categorySpending: Record<string, number> = {};
        transactionsData.forEach((transaction: any) => {
          if (transaction.category_id) {
            categorySpending[transaction.category_id] = (categorySpending[transaction.category_id] || 0) + transaction.amount;
          }
        });

        // Format categories with spent amounts
        const formattedCategories: Category[] = categoriesData.map((category: SupabaseCategory) => ({
          id: category.id,
          name: category.name,
          limit: category.budget_limit,
          spent: categorySpending[category.id] || 0,
          budgetType: category.budget_type,
        }));

        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [session]);

  const addCategory = async (category: Omit<Category, 'id' | 'spent'>) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: session.user.id,
          name: category.name,
          budget_type: category.budgetType,
          budget_limit: category.limit,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        limit: data.budget_limit,
        spent: 0,
        budgetType: data.budget_type,
      };

      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err instanceof Error ? err.message : 'Failed to add category');
      return null;
    }
  };

  return { categories, isLoading, error, addCategory };
}

export function useBudgetSummary() {
  const { session } = useAuth();
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchBudgetSummary = async () => {
      try {
        setIsLoading(true);
        
        // Get budget settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('budget_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which we handle by creating default settings
          throw settingsError;
        }

        // If no settings exist, create default settings
        let settings = settingsData;
        if (!settings) {
          const { data: newSettings, error: createError } = await supabase
            .from('budget_settings')
            .insert({
              user_id: session.user.id,
              income: 0,
              needs_percentage: 50,
              wants_percentage: 30,
              savings_percentage: 20,
            })
            .select()
            .single();

          if (createError) throw createError;
          settings = newSettings;
        }

        // Get income transactions
        const { data: incomeData, error: incomeError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', session.user.id)
          .eq('type', 'income');

        if (incomeError) throw incomeError;

        // Get expense transactions
        const { data: expenseData, error: expenseError } = await supabase
          .from('transactions')
          .select('amount, categories(budget_type)')
          .eq('user_id', session.user.id)
          .eq('type', 'expense');

        if (expenseError) throw expenseError;

        // Calculate total income and expenses
        const income = incomeData.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
        const expenses = expenseData.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
        const balance = income - expenses;

        // Calculate budget limits based on income and percentages
        const needsLimit = (settings.income * settings.needs_percentage) / 100;
        const wantsLimit = (settings.income * settings.wants_percentage) / 100;
        const savingsLimit = (settings.income * settings.savings_percentage) / 100;

        // Calculate spent amounts by budget type
        let needsSpent = 0;
        let wantsSpent = 0;
        let savingsSpent = 0;

        expenseData.forEach((transaction: any) => {
          const budgetType = transaction.categories?.budget_type;
          if (budgetType === 'needs') {
            needsSpent += transaction.amount;
          } else if (budgetType === 'wants') {
            wantsSpent += transaction.amount;
          } else if (budgetType === 'savings') {
            savingsSpent += transaction.amount;
          }
        });

        // Create budget summary
        const summary: BudgetSummary = {
          income: settings.income,
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

        setBudgetSummary(summary);
      } catch (err) {
        console.error('Error fetching budget summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch budget summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetSummary();
  }, [session]);

  const updateIncome = async (income: number) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from('budget_settings')
        .update({ income })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      if (budgetSummary) {
        const needsLimit = (income * data.needs_percentage) / 100;
        const wantsLimit = (income * data.wants_percentage) / 100;
        const savingsLimit = (income * data.savings_percentage) / 100;

        setBudgetSummary({
          ...budgetSummary,
          income,
          needs: {
            ...budgetSummary.needs,
            limit: needsLimit,
          },
          wants: {
            ...budgetSummary.wants,
            limit: wantsLimit,
          },
          savings: {
            ...budgetSummary.savings,
            limit: savingsLimit,
          },
        });
      }

      return data;
    } catch (err) {
      console.error('Error updating income:', err);
      setError(err instanceof Error ? err.message : 'Failed to update income');
      return null;
    }
  };

  return { budgetSummary, isLoading, error, updateIncome };
}
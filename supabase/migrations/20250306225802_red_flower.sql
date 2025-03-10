/*
  # Budget Management Schema
  
  1. New Tables
    - `budget_settings`
      - User's income and budget allocation percentages
    - `categories`
      - Budget categories with limits
    - `transactions`
      - Income and expense transactions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Budget Settings Table
CREATE TABLE IF NOT EXISTS public.budget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  income numeric NOT NULL DEFAULT 0,
  needs_percentage numeric NOT NULL DEFAULT 50,
  wants_percentage numeric NOT NULL DEFAULT 30,
  savings_percentage numeric NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget_type text NOT NULL CHECK (budget_type IN ('needs', 'wants', 'savings')),
  budget_limit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Budget Settings Policies
CREATE POLICY "Users can manage their own budget settings"
  ON public.budget_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can manage their own categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can manage their own transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create default categories function
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS trigger AS $$
BEGIN
  -- Needs categories
  INSERT INTO public.categories (user_id, name, budget_type, budget_limit)
  VALUES
    (NEW.id, 'Housing', 'needs', 0),
    (NEW.id, 'Utilities', 'needs', 0),
    (NEW.id, 'Groceries', 'needs', 0),
    (NEW.id, 'Healthcare', 'needs', 0),
    (NEW.id, 'Transportation', 'needs', 0);

  -- Wants categories
  INSERT INTO public.categories (user_id, name, budget_type, budget_limit)
  VALUES
    (NEW.id, 'Entertainment', 'wants', 0),
    (NEW.id, 'Dining Out', 'wants', 0),
    (NEW.id, 'Shopping', 'wants', 0),
    (NEW.id, 'Hobbies', 'wants', 0);

  -- Savings categories
  INSERT INTO public.categories (user_id, name, budget_type, budget_limit)
  VALUES
    (NEW.id, 'Emergency Fund', 'savings', 0),
    (NEW.id, 'Retirement', 'savings', 0),
    (NEW.id, 'Investments', 'savings', 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default categories trigger
CREATE OR REPLACE TRIGGER create_default_categories_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();
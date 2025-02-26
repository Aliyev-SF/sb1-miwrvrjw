/*
  # Initial Schema for FinTrack App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `title` (text)
      - `amount` (numeric)
      - `type` (text, 'income' or 'expense')
      - `category_id` (uuid, references categories.id)
      - `date` (timestamp)
      - `created_at` (timestamp)
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `name` (text)
      - `budget_type` (text, 'needs', 'wants', or 'savings')
      - `budget_limit` (numeric)
      - `created_at` (timestamp)
    - `budget_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `income` (numeric)
      - `needs_percentage` (numeric)
      - `wants_percentage` (numeric)
      - `savings_percentage` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  budget_type text NOT NULL CHECK (budget_type IN ('needs', 'wants', 'savings')),
  budget_limit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create budget_settings table
CREATE TABLE IF NOT EXISTS budget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  income numeric NOT NULL DEFAULT 0,
  needs_percentage numeric NOT NULL DEFAULT 50,
  wants_percentage numeric NOT NULL DEFAULT 30,
  savings_percentage numeric NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for categories
CREATE POLICY "Users can view their own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for budget_settings
CREATE POLICY "Users can view their own budget settings"
  ON budget_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget settings"
  ON budget_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget settings"
  ON budget_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create default categories function
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Needs categories
  INSERT INTO categories (user_id, name, budget_type, budget_limit)
  VALUES 
    (NEW.id, 'Housing', 'needs', 0),
    (NEW.id, 'Groceries', 'needs', 0),
    (NEW.id, 'Utilities', 'needs', 0),
    (NEW.id, 'Transportation', 'needs', 0),
    (NEW.id, 'Healthcare', 'needs', 0);
  
  -- Wants categories
  INSERT INTO categories (user_id, name, budget_type, budget_limit)
  VALUES 
    (NEW.id, 'Dining Out', 'wants', 0),
    (NEW.id, 'Entertainment', 'wants', 0),
    (NEW.id, 'Shopping', 'wants', 0),
    (NEW.id, 'Subscriptions', 'wants', 0);
  
  -- Savings categories
  INSERT INTO categories (user_id, name, budget_type, budget_limit)
  VALUES 
    (NEW.id, 'Emergency Fund', 'savings', 0),
    (NEW.id, 'Retirement', 'savings', 0),
    (NEW.id, 'Investments', 'savings', 0);
  
  -- Create default budget settings
  INSERT INTO budget_settings (user_id, income, needs_percentage, wants_percentage, savings_percentage)
  VALUES (NEW.id, 0, 50, 30, 20);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create default categories when a new profile is created
CREATE TRIGGER create_default_categories_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_categories();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
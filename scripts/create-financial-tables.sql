-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN ('service', 'product', 'rent', 'utilities', 'salary', 'supplies', 'marketing', 'other')),
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  related_appointment_id UUID,
  related_client_id UUID,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  total_income NUMERIC(10, 2) NOT NULL,
  total_expenses NUMERIC(10, 2) NOT NULL,
  profit NUMERIC(10, 2) NOT NULL,
  completed_appointments INTEGER NOT NULL,
  total_work_hours NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users full access to transactions" ON transactions;
DROP POLICY IF EXISTS "Allow public read access to transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated users full access to daily_summaries" ON daily_summaries;
DROP POLICY IF EXISTS "Allow public read access to daily_summaries" ON daily_summaries;

-- Create policy for authenticated users for transactions
CREATE POLICY "Allow authenticated users full access to transactions" ON transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access to transactions
CREATE POLICY "Allow public read access to transactions" ON transactions
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users for daily_summaries
CREATE POLICY "Allow authenticated users full access to daily_summaries" ON daily_summaries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access to daily_summaries
CREATE POLICY "Allow public read access to daily_summaries" ON daily_summaries
  FOR SELECT
  TO anon
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_daily_summaries_updated_at ON daily_summaries;

-- Create trigger for transactions
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for daily_summaries
CREATE TRIGGER update_daily_summaries_updated_at
BEFORE UPDATE ON daily_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
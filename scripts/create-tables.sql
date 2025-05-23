-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  nif TEXT,
  notes TEXT,
  initials TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add postal_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE clients ADD COLUMN postal_code TEXT;
  END IF;
  
  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'city'
  ) THEN
    ALTER TABLE clients ADD COLUMN city TEXT;
  END IF;
  
  -- Add nif column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'nif'
  ) THEN
    ALTER TABLE clients ADD COLUMN nif TEXT;
  END IF;
END $$;

-- Create client_services table for services history
CREATE TABLE IF NOT EXISTS client_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_summary table
CREATE TABLE IF NOT EXISTS daily_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_income NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_expense NUMERIC(10, 2) NOT NULL DEFAULT 0,
  net_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  client TEXT NOT NULL,
  client_initials TEXT,
  client_avatar TEXT,
  service TEXT NOT NULL,
  service_id TEXT,
  service_duration INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  -- Enable RLS for clients table if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'clients' AND rowsecurity = true
  ) THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS for client_services table if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'client_services' AND rowsecurity = true
  ) THEN
    ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS for transactions table if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'transactions' AND rowsecurity = true
  ) THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS for daily_summary table if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'daily_summary' AND rowsecurity = true
  ) THEN
    ALTER TABLE daily_summary ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS for appointments table if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'appointments' AND rowsecurity = true
  ) THEN
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Create policy for clients table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Allow public access to clients'
  ) THEN
    CREATE POLICY "Allow public access to clients" ON clients FOR ALL USING (true);
  END IF;
  
  -- Create policy for client_services table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_services' AND policyname = 'Allow public access to client_services'
  ) THEN
    CREATE POLICY "Allow public access to client_services" ON client_services FOR ALL USING (true);
  END IF;
  
  -- Create policy for transactions table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' AND policyname = 'Allow public access to transactions'
  ) THEN
    CREATE POLICY "Allow public access to transactions" ON transactions FOR ALL USING (true);
  END IF;
  
  -- Create policy for daily_summary table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'daily_summary' AND policyname = 'Allow public access to daily_summary'
  ) THEN
    CREATE POLICY "Allow public access to daily_summary" ON daily_summary FOR ALL USING (true);
  END IF;
  
  -- Create policy for appointments table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' AND policyname = 'Allow public access to appointments'
  ) THEN
    CREATE POLICY "Allow public access to appointments" ON appointments FOR ALL USING (true);
  END IF;
END $$;

-- Insert example client
INSERT INTO clients (name, email, phone, initials, status)
VALUES ('Cliente Exemplo', 'exemplo@email.com', '123456789', 'CE', 'active')
ON CONFLICT DO NOTHING; 
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

-- Create client_services table for services history
CREATE TABLE IF NOT EXISTS client_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  price NUMERIC(10, 2) NOT NULL,
  attended BOOLEAN NOT NULL DEFAULT true,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_attendance table for attendance history
CREATE TABLE IF NOT EXISTS client_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  attended BOOLEAN NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users full access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users full access to client_services" ON client_services;
DROP POLICY IF EXISTS "Allow public read access to client_services" ON client_services;
DROP POLICY IF EXISTS "Allow authenticated users full access to client_attendance" ON client_attendance;
DROP POLICY IF EXISTS "Allow public read access to client_attendance" ON client_attendance;

-- Create policy for authenticated users for clients
CREATE POLICY "Allow authenticated users full access to clients" ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access to clients
CREATE POLICY "Allow public read access to clients" ON clients
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users for client_services
CREATE POLICY "Allow authenticated users full access to client_services" ON client_services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access to client_services
CREATE POLICY "Allow public read access to client_services" ON client_services
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users for client_attendance
CREATE POLICY "Allow authenticated users full access to client_attendance" ON client_attendance
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access to client_attendance
CREATE POLICY "Allow public read access to client_attendance" ON client_attendance
  FOR SELECT
  TO anon
  USING (true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_client_services_updated_at ON client_services;
DROP TRIGGER IF EXISTS update_client_attendance_updated_at ON client_attendance;

-- Create trigger for clients
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for client_services
CREATE TRIGGER update_client_services_updated_at
BEFORE UPDATE ON client_services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for client_attendance
CREATE TRIGGER update_client_attendance_updated_at
BEFORE UPDATE ON client_attendance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
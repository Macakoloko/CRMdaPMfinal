-- Verificar se a tabela appointments existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointments') THEN
    RAISE NOTICE 'Tabela appointments não existe, criando...';
    
    -- Criar a tabela appointments
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      start TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      client TEXT NOT NULL,
      client_id TEXT NOT NULL,
      client_initials TEXT NOT NULL,
      client_avatar TEXT,
      service TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_duration INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Criar RLS policies
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

    -- Criar policy para usuários autenticados
    CREATE POLICY "Allow authenticated users full access" ON appointments
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);

    -- Criar policy para acesso público de leitura
    CREATE POLICY "Allow public read access" ON appointments
      FOR SELECT
      TO anon
      USING (true);
      
    RAISE NOTICE 'Tabela appointments criada com sucesso!';
  ELSE
    RAISE NOTICE 'Tabela appointments já existe, verificando estrutura...';
    
    -- Verificar e adicionar colunas que possam estar faltando
    BEGIN
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Agendamento';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '1 hour';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client TEXT NOT NULL DEFAULT 'Cliente';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_id TEXT NOT NULL DEFAULT 'default-client-id';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_initials TEXT NOT NULL DEFAULT 'CL';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_avatar TEXT;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service TEXT NOT NULL DEFAULT 'Serviço';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_id TEXT NOT NULL DEFAULT 'default-service-id';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_duration INTEGER NOT NULL DEFAULT 60;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'blue';
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      
      -- Tentar renomear colunas camelCase para snake_case se existirem
      BEGIN
        ALTER TABLE appointments RENAME COLUMN "clientId" TO client_id;
      EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Coluna clientId não existe ou já foi renomeada';
      END;
      
      BEGIN
        ALTER TABLE appointments RENAME COLUMN "clientInitials" TO client_initials;
      EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Coluna clientInitials não existe ou já foi renomeada';
      END;
      
      BEGIN
        ALTER TABLE appointments RENAME COLUMN "clientAvatar" TO client_avatar;
      EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Coluna clientAvatar não existe ou já foi renomeada';
      END;
      
      BEGIN
        ALTER TABLE appointments RENAME COLUMN "serviceId" TO service_id;
      EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Coluna serviceId não existe ou já foi renomeada';
      END;
      
      BEGIN
        ALTER TABLE appointments RENAME COLUMN "serviceDuration" TO service_duration;
      EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Coluna serviceDuration não existe ou já foi renomeada';
      END;
      
      RAISE NOTICE 'Estrutura da tabela appointments verificada e corrigida!';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao verificar/corrigir estrutura: %', SQLERRM;
    END;
    
    -- Verificar e corrigir políticas RLS
    BEGIN
      -- Verificar se RLS está habilitado
      IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND rowsecurity = true
      ) THEN
        ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para a tabela appointments';
      END IF;
      
      -- Verificar e criar políticas
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Allow authenticated users full access'
      ) THEN
        CREATE POLICY "Allow authenticated users full access" ON appointments
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);
        RAISE NOTICE 'Política para usuários autenticados criada';
      END IF;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Allow public read access'
      ) THEN
        CREATE POLICY "Allow public read access" ON appointments
          FOR SELECT
          TO anon
          USING (true);
        RAISE NOTICE 'Política para acesso público de leitura criada';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao verificar/corrigir políticas RLS: %', SQLERRM;
    END;
  END IF;
END
$$; 
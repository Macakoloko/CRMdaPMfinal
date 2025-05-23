-- Script para criar a tabela de agendamentos
-- Verifica se a tabela já existe e a cria se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'appointments'
    ) THEN
        -- Criar a tabela appointments
        CREATE TABLE public.appointments (
            id UUID PRIMARY KEY,
            title TEXT NOT NULL,
            start TIMESTAMPTZ NOT NULL,
            end_time TIMESTAMPTZ NOT NULL,
            client TEXT,
            client_id TEXT,
            client_initials TEXT,
            client_avatar TEXT,
            service TEXT,
            service_id TEXT,
            service_duration INTEGER,
            status TEXT DEFAULT 'confirmed',
            color TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Adicionar comentário à tabela
        COMMENT ON TABLE public.appointments IS 'Tabela de agendamentos';

        -- Configurar RLS (Row Level Security)
        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

        -- Criar política para permitir acesso aos dados
        CREATE POLICY "Permitir acesso aos agendamentos" 
        ON public.appointments 
        FOR ALL 
        USING (true);
        
        RAISE NOTICE 'Tabela appointments criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela appointments já existe. Verificando colunas...';
        
        -- Verificar e adicionar colunas que possam estar faltando
        -- client_id
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'client_id'
        ) THEN
            ALTER TABLE public.appointments ADD COLUMN client_id TEXT;
            RAISE NOTICE 'Coluna client_id adicionada.';
        END IF;
        
        -- client_initials
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'client_initials'
        ) THEN
            ALTER TABLE public.appointments ADD COLUMN client_initials TEXT;
            RAISE NOTICE 'Coluna client_initials adicionada.';
        END IF;
        
        -- client_avatar
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'client_avatar'
        ) THEN
            ALTER TABLE public.appointments ADD COLUMN client_avatar TEXT;
            RAISE NOTICE 'Coluna client_avatar adicionada.';
        END IF;
        
        -- service_id
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'service_id'
        ) THEN
            ALTER TABLE public.appointments ADD COLUMN service_id TEXT;
            RAISE NOTICE 'Coluna service_id adicionada.';
        END IF;
        
        -- service_duration
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'service_duration'
        ) THEN
            ALTER TABLE public.appointments ADD COLUMN service_duration INTEGER;
            RAISE NOTICE 'Coluna service_duration adicionada.';
        END IF;
        
        -- notes
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'notes'
        ) THEN
            ALTER TABLE public.appointments ADD COLUMN notes TEXT;
            RAISE NOTICE 'Coluna notes adicionada.';
        END IF;
        
        -- Verificar se existem colunas em camelCase que precisam ser renomeadas para snake_case
        -- clientId -> client_id
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'clientId'
        ) AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'client_id'
        ) THEN
            -- Se ambas existem, copiar dados e remover a coluna antiga
            UPDATE public.appointments SET client_id = "clientId";
            ALTER TABLE public.appointments DROP COLUMN "clientId";
            RAISE NOTICE 'Dados migrados de clientId para client_id e coluna clientId removida.';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'clientId'
        ) THEN
            -- Se apenas a camelCase existe, renomear
            ALTER TABLE public.appointments RENAME COLUMN "clientId" TO client_id;
            RAISE NOTICE 'Coluna clientId renomeada para client_id.';
        END IF;
        
        -- clientInitials -> client_initials
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'clientInitials'
        ) AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'client_initials'
        ) THEN
            -- Se ambas existem, copiar dados e remover a coluna antiga
            UPDATE public.appointments SET client_initials = "clientInitials";
            ALTER TABLE public.appointments DROP COLUMN "clientInitials";
            RAISE NOTICE 'Dados migrados de clientInitials para client_initials e coluna clientInitials removida.';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'clientInitials'
        ) THEN
            -- Se apenas a camelCase existe, renomear
            ALTER TABLE public.appointments RENAME COLUMN "clientInitials" TO client_initials;
            RAISE NOTICE 'Coluna clientInitials renomeada para client_initials.';
        END IF;
        
        -- clientAvatar -> client_avatar
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'clientAvatar'
        ) AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'client_avatar'
        ) THEN
            -- Se ambas existem, copiar dados e remover a coluna antiga
            UPDATE public.appointments SET client_avatar = "clientAvatar";
            ALTER TABLE public.appointments DROP COLUMN "clientAvatar";
            RAISE NOTICE 'Dados migrados de clientAvatar para client_avatar e coluna clientAvatar removida.';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'clientAvatar'
        ) THEN
            -- Se apenas a camelCase existe, renomear
            ALTER TABLE public.appointments RENAME COLUMN "clientAvatar" TO client_avatar;
            RAISE NOTICE 'Coluna clientAvatar renomeada para client_avatar.';
        END IF;
        
        -- serviceId -> service_id
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'serviceId'
        ) AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'service_id'
        ) THEN
            -- Se ambas existem, copiar dados e remover a coluna antiga
            UPDATE public.appointments SET service_id = "serviceId";
            ALTER TABLE public.appointments DROP COLUMN "serviceId";
            RAISE NOTICE 'Dados migrados de serviceId para service_id e coluna serviceId removida.';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'serviceId'
        ) THEN
            -- Se apenas a camelCase existe, renomear
            ALTER TABLE public.appointments RENAME COLUMN "serviceId" TO service_id;
            RAISE NOTICE 'Coluna serviceId renomeada para service_id.';
        END IF;
        
        -- serviceDuration -> service_duration
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'serviceDuration'
        ) AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'service_duration'
        ) THEN
            -- Se ambas existem, copiar dados e remover a coluna antiga
            UPDATE public.appointments SET service_duration = "serviceDuration";
            ALTER TABLE public.appointments DROP COLUMN "serviceDuration";
            RAISE NOTICE 'Dados migrados de serviceDuration para service_duration e coluna serviceDuration removida.';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'serviceDuration'
        ) THEN
            -- Se apenas a camelCase existe, renomear
            ALTER TABLE public.appointments RENAME COLUMN "serviceDuration" TO service_duration;
            RAISE NOTICE 'Coluna serviceDuration renomeada para service_duration.';
        END IF;
        
        -- endTime -> end_time
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'endTime'
        ) AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'end_time'
        ) THEN
            -- Se ambas existem, copiar dados e remover a coluna antiga
            UPDATE public.appointments SET end_time = "endTime";
            ALTER TABLE public.appointments DROP COLUMN "endTime";
            RAISE NOTICE 'Dados migrados de endTime para end_time e coluna endTime removida.';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments' 
            AND column_name = 'endTime'
        ) THEN
            -- Se apenas a camelCase existe, renomear
            ALTER TABLE public.appointments RENAME COLUMN "endTime" TO end_time;
            RAISE NOTICE 'Coluna endTime renomeada para end_time.';
        END IF;
    END IF;
END
$$; 
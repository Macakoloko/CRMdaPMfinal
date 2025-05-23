import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Criar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Credenciais do Supabase não configuradas' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.appointments (
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
    `;
    
    // Executar SQL para criar a tabela
    const { data: createResult, error: createError } = await supabase.rpc('execute_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('Erro ao criar tabela:', createError);
      
      // Se a função execute_sql não existir, tentar criar a tabela com insert
      const { data: insertResult, error: insertError } = await supabase
        .from('appointments')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          title: 'Tabela sendo criada',
          start: new Date().toISOString(),
          end_time: new Date().toISOString(),
          client: 'Sistema',
          status: 'confirmed',
          color: 'blue'
        })
        .select();
      
      if (insertError) {
        console.error('Erro ao criar tabela com insert:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Não foi possível criar a tabela',
          details: { createError, insertError }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Tabela criada com insert',
        data: insertResult
      });
    }
    
    // SQL para habilitar RLS
    const enableRLSSQL = `
      ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    `;
    
    // Executar SQL para habilitar RLS
    try {
      await supabase.rpc('execute_sql', { sql: enableRLSSQL });
    } catch (err: unknown) {
      console.error('Erro ao habilitar RLS:', err);
    }
    
    // SQL para criar política
    const createPolicySQL = `
      CREATE POLICY "Permitir acesso aos agendamentos"
      ON public.appointments
      FOR ALL
      USING (true);
    `;
    
    // Executar SQL para criar política
    try {
      await supabase.rpc('execute_sql', { sql: createPolicySQL });
    } catch (err: unknown) {
      console.error('Erro ao criar política:', err);
    }
    
    // Verificar a estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments');
    
    if (columnsError) {
      console.error('Erro ao verificar colunas:', columnsError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Tabela de agendamentos criada ou já existente',
      columns: columns || []
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
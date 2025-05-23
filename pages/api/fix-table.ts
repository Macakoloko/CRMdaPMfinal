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
    // SQL para adicionar as colunas que podem estar faltando
    const sql = `
    -- Adicionar colunas que podem estar faltando
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_avatar TEXT;
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
    `;
    
    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Tentar uma abordagem alternativa
      console.error('Erro ao executar SQL via RPC:', error);
      
      // Verificar se a tabela existe
      const { data: sample, error: sampleError } = await supabase
        .from('appointments')
        .select('count')
        .limit(1);
      
      if (sampleError) {
        return res.status(500).json({
          error: 'Erro ao acessar tabela appointments',
          details: sampleError
        });
      }
      
      return res.status(200).json({
        success: false,
        message: 'Não foi possível executar o SQL, mas a tabela existe',
        error
      });
    }
    
    // Verificar se a correção funcionou
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments');
    
    return res.status(200).json({
      success: true,
      message: 'SQL executado com sucesso',
      columns: columns || [],
      columnsError
    });
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
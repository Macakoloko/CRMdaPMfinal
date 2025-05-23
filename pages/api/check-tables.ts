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
    // Verificar se a tabela appointments existe
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments');
    
    if (tablesError) {
      return res.status(500).json({ error: 'Erro ao verificar tabelas', details: tablesError });
    }
    
    const appointmentsExists = tablesData && tablesData.length > 0;
    
    if (!appointmentsExists) {
      return res.status(404).json({ error: 'Tabela appointments não encontrada' });
    }
    
    // Verificar a estrutura da tabela appointments
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments');
    
    if (columnsError) {
      return res.status(500).json({ error: 'Erro ao verificar colunas', details: columnsError });
    }
    
    // Tentar fazer uma contagem simples na tabela
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });
    
    // Verificar permissões RLS
    const hasRLSAccess = !countError;
    
    // Retornar informações sobre a tabela
    return res.status(200).json({
      success: true,
      tableExists: appointmentsExists,
      columns: columnsData,
      hasRLSAccess,
      countError: countError ? countError.message : null,
      count
    });
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: error });
  }
} 
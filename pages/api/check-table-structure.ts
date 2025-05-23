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
    // Verificar a estrutura da tabela appointments
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments');
    
    if (error) {
      // Tentar uma abordagem alternativa
      const { data: sample, error: sampleError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        return res.status(500).json({
          error: 'Erro ao verificar estrutura da tabela',
          details: error,
          sampleError
        });
      }
      
      // Se conseguiu buscar uma amostra, podemos inferir a estrutura
      const structure = sample && sample.length > 0 
        ? Object.keys(sample[0]).map(key => ({ column_name: key }))
        : [];
      
      return res.status(200).json({
        success: true,
        message: 'Estrutura inferida da tabela appointments',
        columns: structure,
        sample
      });
    }
    
    // Tentar criar um SQL para corrigir a tabela
    const missingColumns = [
      'client_avatar',
      'notes'
    ].filter(col => !data.some(c => c.column_name === col));
    
    let fixSQL = '';
    if (missingColumns.length > 0) {
      fixSQL = missingColumns.map(col => {
        if (col === 'client_avatar') {
          return `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_avatar TEXT;`;
        }
        if (col === 'notes') {
          return `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;`;
        }
        return '';
      }).join('\n');
    }
    
    return res.status(200).json({
      success: true,
      columns: data,
      missingColumns,
      fixSQL
    });
  } catch (error) {
    console.error('Erro ao verificar estrutura da tabela:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
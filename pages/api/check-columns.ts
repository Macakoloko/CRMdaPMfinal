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
    // Buscar um registro para verificar os campos
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados',
        details: error
      });
    }
    
    // Extrair os campos
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return res.status(200).json({
      success: true,
      message: 'Colunas encontradas',
      columns,
      data: data || []
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
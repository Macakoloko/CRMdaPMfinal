import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Criar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Credenciais do Supabase não configuradas' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Ler o arquivo SQL
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'create-appointments-table.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o script SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sqlScript
    });
    
    if (error) {
      console.error('Erro ao executar script SQL:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao executar script SQL',
        details: error
      });
    }
    
    // Verificar a estrutura da tabela após a execução
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
      message: 'Script SQL executado com sucesso',
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
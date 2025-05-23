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
      .rpc('get_tables_info')
      .select('*');
    
    if (tablesError) {
      // Tentar uma abordagem alternativa
      console.log("Erro ao usar RPC, tentando consulta direta:", tablesError);
      
      // Verificar se a tabela appointments existe usando uma consulta direta
      try {
        const { data: testData, error: testError } = await supabase
          .from('appointments')
          .select('id')
          .limit(1);
          
        if (testError) {
          return res.status(500).json({ 
            error: 'Erro ao acessar tabela appointments', 
            details: testError 
          });
        }
        
        // Se chegou aqui, a tabela existe
        return res.status(200).json({
          success: true,
          message: 'Tabela appointments existe e está acessível',
          testData
        });
      } catch (directError) {
        return res.status(500).json({ 
          error: 'Erro ao acessar tabela appointments diretamente', 
          details: directError 
        });
      }
    }
    
    // Tentar criar um registro de teste simples
    const testAppointment = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Teste API',
      start: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      client: 'Cliente Teste',
      client_id: 'test-id',
      client_initials: 'CT',
      client_avatar: null,
      service: 'Serviço Teste',
      service_id: 'test-service',
      service_duration: 60,
      notes: null,
      status: 'confirmed',
      color: 'blue'
    };
    
    // Primeiro excluir se já existir
    await supabase
      .from('appointments')
      .delete()
      .eq('id', testAppointment.id);
    
    // Tentar inserir
    const { data: insertData, error: insertError } = await supabase
      .from('appointments')
      .insert(testAppointment);
    
    if (insertError) {
      return res.status(500).json({
        error: 'Erro ao inserir registro de teste',
        details: insertError
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Tabela appointments verificada e teste de inserção bem-sucedido',
      tables: tablesData,
      insertResult: insertData || 'Inserido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error 
    });
  }
} 
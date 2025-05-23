import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Criar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Credenciais do Supabase não configuradas' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Criar um agendamento para teste
    const testAppointment = {
      id: uuidv4(),
      title: 'Agendamento para Exclusão',
      start: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      client: 'Cliente Teste Exclusão',
      clientid: 'test-delete-id',
      clientinitials: 'CTE',
      service: 'Serviço Teste Exclusão',
      serviceid: 'test-delete-service',
      serviceduration: 60,
      status: 'confirmed',
      color: 'red'
    };
    
    // Inserir o agendamento
    const { data: insertedData, error: insertError } = await supabase
      .from('appointments')
      .insert(testAppointment)
      .select();
    
    if (insertError) {
      console.error('Erro ao criar agendamento para teste:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar agendamento para teste',
        details: insertError
      });
    }
    
    console.log('Agendamento criado para teste de exclusão:', insertedData);
    
    // Excluir o agendamento
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', testAppointment.id);
    
    if (deleteError) {
      console.error('Erro ao excluir agendamento:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir agendamento',
        details: deleteError
      });
    }
    
    console.log('Agendamento excluído com sucesso');
    
    // Verificar se o agendamento foi realmente excluído
    const { data: checkData, error: checkError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', testAppointment.id);
    
    if (checkError) {
      console.error('Erro ao verificar exclusão:', checkError);
    }
    
    const wasDeleted = !checkData || checkData.length === 0;
    
    return res.status(200).json({
      success: true,
      message: 'Teste de exclusão concluído',
      wasDeleted,
      originalAppointment: insertedData
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 
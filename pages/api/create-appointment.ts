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
    // Criar um agendamento mínimo
    const minimalAppointment = {
      id: uuidv4(),
      title: 'Teste API Minimal',
      start: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      client: 'Cliente Teste',
      clientid: 'test-id',
      clientinitials: 'CT',
      service: 'Serviço Teste',
      serviceid: 'test-service',
      serviceduration: 60,
      status: 'confirmed',
      color: 'blue'
    };
    
    console.log('Tentando criar agendamento:', minimalAppointment);
    
    // Inserir o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(minimalAppointment)
      .select();
    
    if (error) {
      console.error('Erro ao criar agendamento:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar agendamento',
        details: error
      });
    }
    
    console.log('Agendamento criado com sucesso:', data);
    
    // Limpar o teste
    await supabase
      .from('appointments')
      .delete()
      .eq('id', minimalAppointment.id);
    
    return res.status(200).json({
      success: true,
      message: 'Agendamento criado e excluído com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao testar criação de agendamento:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 
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
    // Criar um agendamento de teste
    const now = new Date();
    const testAppointment = {
      id: uuidv4(),
      title: "Teste de Agendamento",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0).toISOString(),
      end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0).toISOString(),
      client: "Cliente Teste",
      clientId: "test-client-id",
      clientInitials: "CT",
      clientAvatar: null,
      service: "Serviço Teste",
      serviceId: "test-service-id",
      serviceDuration: 60,
      notes: "Teste de criação de agendamento via API",
      status: "confirmed",
      color: "blue"
    };
    
    // Tentar inserir o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(testAppointment)
      .select();
    
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error,
        appointment: testAppointment
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Agendamento de teste criado com sucesso',
      appointment: data
    });
  } catch (error: any) {
    console.error('Erro ao criar agendamento de teste:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message || error 
    });
  }
} 
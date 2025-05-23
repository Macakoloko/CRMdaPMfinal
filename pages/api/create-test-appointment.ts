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
    const testAppointment = {
      id: uuidv4(),
      title: 'Agendamento de Teste',
      start: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      client: 'Cliente Teste',
      client_id: 'test-client-id',
      client_initials: 'CT',
      client_avatar: null,
      service: 'Serviço Teste',
      service_id: 'test-service-id',
      service_duration: 60,
      status: 'confirmed',
      color: 'blue',
      notes: 'Este é um agendamento de teste'
    };
    
    // Inserir o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(testAppointment)
      .select();
    
    if (error) {
      console.error('Erro ao criar agendamento de teste:', error);
      
      // Tentar uma abordagem alternativa com menos campos
      const simpleAppointment = {
        id: uuidv4(),
        title: 'Agendamento Simples',
        start: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        client: 'Cliente Teste',
        clientid: 'test-client-id',
        clientinitials: 'CT',
        service: 'Serviço Teste',
        serviceid: 'test-service-id',
        serviceduration: 60,
        status: 'confirmed',
        color: 'blue'
      };
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('appointments')
        .insert(simpleAppointment)
        .select();
      
      if (simpleError) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao criar agendamento de teste',
          details: { originalError: error, simpleError }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Agendamento simples criado com sucesso',
        data: simpleData
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Agendamento de teste criado com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
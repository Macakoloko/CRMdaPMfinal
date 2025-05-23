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
    // Criar um agendamento simulando o formato do AppointmentContext
    const now = new Date();
    const later = new Date(now.getTime() + 3600000); // 1 hora depois
    
    // Dados do agendamento no formato do AppointmentContext
    const appointmentData = {
      client: 'Cliente Teste API',
      clientId: 'test-client-id',
      clientInitials: 'CTA',
      service: 'Serviço Teste API',
      serviceId: 'test-service-id',
      serviceDuration: 60,
      start: now,
      end: later,
      notes: 'Teste de criação via API',
      status: 'confirmed' as const
    };
    
    // Gerar ID e título
    const id = uuidv4();
    const title = `${appointmentData.client} - ${appointmentData.service}`;
    const color = 'blue';
    
    // Preparar dados para o Supabase
    const appointmentForSupabase = {
      id,
      title,
      start: appointmentData.start.toISOString(),
      end_time: appointmentData.end.toISOString(),
      client: appointmentData.client,
      clientid: appointmentData.clientId,
      clientinitials: appointmentData.clientInitials,
      service: appointmentData.service,
      serviceid: appointmentData.serviceId,
      serviceduration: appointmentData.serviceDuration,
      notes: appointmentData.notes,
      status: appointmentData.status,
      color
    };
    
    console.log('Tentando criar agendamento:', appointmentForSupabase);
    
    // Inserir o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentForSupabase)
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
    
    return res.status(200).json({
      success: true,
      message: 'Agendamento criado com sucesso',
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
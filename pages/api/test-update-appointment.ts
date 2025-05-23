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
    // Buscar o último agendamento criado
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fetchError || !appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nenhum agendamento encontrado',
        details: fetchError
      });
    }
    
    const appointment = appointments[0];
    
    // Preparar dados para atualização
    const updateData = {
      title: `${appointment.client} - Atualizado`,
      notes: 'Agendamento atualizado via API'
    };
    
    console.log('Tentando atualizar agendamento:', appointment.id, updateData);
    
    // Atualizar o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointment.id)
      .select();
    
    if (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar agendamento',
        details: error
      });
    }
    
    console.log('Agendamento atualizado com sucesso:', data);
    
    return res.status(200).json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Obter credenciais do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Verificar se as credenciais estão definidas
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: 'Credenciais do Supabase não configuradas',
      env: {
        supabaseUrl: supabaseUrl ? 'Definido' : 'Não definido',
        supabaseKey: supabaseKey ? 'Definido (parcial): ' + supabaseKey.substring(0, 10) + '...' : 'Não definido'
      }
    });
  }
  
  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Testar conexão com o Supabase
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    // Verificar tabelas disponíveis
    const { data: tablesData, error: tablesError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    // Verificar especificamente a tabela appointments
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);
    
    // Testar inserção simples
    const testId = 'test-' + Date.now();
    const { error: insertError } = await supabase
      .from('appointments')
      .insert({
        id: testId,
        title: 'Teste Debug API',
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
      });
    
    // Limpar o teste
    if (!insertError) {
      await supabase
        .from('appointments')
        .delete()
        .eq('id', testId);
    }
    
    return res.status(200).json({
      success: true,
      connection: {
        success: !versionError,
        version: versionData || 'N/A',
        error: versionError
      },
      tables: {
        success: !tablesError,
        data: tablesData || [],
        error: tablesError
      },
      appointments: {
        success: !appointmentsError,
        data: appointmentsData || 'N/A',
        error: appointmentsError
      },
      insertTest: {
        success: !insertError,
        error: insertError
      },
      credentials: {
        supabaseUrl: supabaseUrl.substring(0, 15) + '...',
        supabaseKey: supabaseKey.substring(0, 10) + '...'
      }
    });
  } catch (error) {
    console.error('Erro ao depurar conexão com Supabase:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao depurar conexão com Supabase',
      details: error
    });
  }
} 
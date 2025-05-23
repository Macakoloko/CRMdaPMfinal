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
    // Verificar se a tabela existe
    const { data: tableData, error: tableError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (tableError) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao acessar tabela',
        details: tableError
      });
    }
    
    // Extrair os nomes das colunas existentes
    const existingColumns = tableData && tableData.length > 0 
      ? Object.keys(tableData[0]) 
      : [];
    
    console.log('Colunas existentes:', existingColumns);
    
    // Colunas que queremos garantir que existam
    const requiredColumns = [
      { name: 'client_id', defaultValue: '' },
      { name: 'client_initials', defaultValue: '' },
      { name: 'client_avatar', defaultValue: null },
      { name: 'service_id', defaultValue: '' },
      { name: 'service_duration', defaultValue: 60 },
      { name: 'notes', defaultValue: '' },
      { name: 'end_time', defaultValue: new Date().toISOString() }
    ];
    
    const results: Record<string, string> = {};
    
    // Verificar e adicionar colunas faltantes
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col.name)) {
        try {
          // Tentar adicionar a coluna inserindo um valor
          const { error: updateError } = await supabase
            .from('appointments')
            .update({ [col.name]: col.defaultValue })
            .eq('id', tableData[0].id);
          
          if (updateError) {
            results[col.name] = `Erro: ${updateError.message}`;
          } else {
            results[col.name] = 'Adicionada';
          }
        } catch (error) {
          console.error(`Erro ao adicionar coluna ${col.name}:`, error);
          results[col.name] = `Erro: ${(error as Error).message}`;
        }
      } else {
        results[col.name] = 'Já existe';
      }
    }
    
    // Verificar colunas em camelCase
    const camelCaseColumns = [
      { old: 'clientid', new: 'client_id' },
      { old: 'clientId', new: 'client_id' },
      { old: 'clientinitials', new: 'client_initials' },
      { old: 'clientInitials', new: 'client_initials' },
      { old: 'clientavatar', new: 'client_avatar' },
      { old: 'clientAvatar', new: 'client_avatar' },
      { old: 'serviceid', new: 'service_id' },
      { old: 'serviceId', new: 'service_id' },
      { old: 'serviceduration', new: 'service_duration' },
      { old: 'serviceDuration', new: 'service_duration' },
      { old: 'endtime', new: 'end_time' },
      { old: 'endTime', new: 'end_time' }
    ];
    
    for (const col of camelCaseColumns) {
      if (existingColumns.includes(col.old)) {
        results[`${col.old} encontrado`] = 'Precisa ser migrado';
      }
    }
    
    // Verificar a estrutura final da tabela
    const { data: finalData, error: finalError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    const finalColumns = finalData && finalData.length > 0 
      ? Object.keys(finalData[0]) 
      : [];
    
    return res.status(200).json({
      success: true,
      message: 'Verificação de colunas concluída',
      results,
      existingColumns,
      finalColumns
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
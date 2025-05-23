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
    const { data: tableExists, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments')
      .single();
    
    if (checkError) {
      console.error('Erro ao verificar tabela:', checkError);
    }
    
    let result;
    
    if (!tableExists) {
      // Criar a tabela se não existir
      const { data: createResult, error: createError } = await supabase.rpc('create_appointments_table');
      
      if (createError) {
        // Se a função RPC não existir, criar a tabela diretamente
        const { data: directResult, error: directError } = await supabase
          .from('appointments')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            title: 'Tabela sendo criada',
            start: new Date().toISOString(),
            end_time: new Date().toISOString(),
            client: 'Sistema',
            status: 'confirmed',
            color: 'blue'
          })
          .select();
        
        if (directError) {
          // Tentar criar a tabela com SQL
          try {
            // Criar tabela com colunas básicas
            await supabase.rpc('create_table_if_not_exists', {
              table_name: 'appointments',
              columns: `
                id UUID PRIMARY KEY,
                title TEXT NOT NULL,
                start TIMESTAMPTZ NOT NULL,
                end_time TIMESTAMPTZ NOT NULL,
                client TEXT,
                client_id TEXT,
                client_initials TEXT,
                client_avatar TEXT,
                service TEXT,
                service_id TEXT,
                service_duration INTEGER,
                status TEXT DEFAULT 'confirmed',
                color TEXT,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
              `
            });
            
            // Habilitar RLS
            await supabase.rpc('enable_rls', { table_name: 'appointments' });
            
            // Criar política
            await supabase.rpc('create_policy', {
              table_name: 'appointments',
              policy_name: 'Permitir acesso aos agendamentos',
              policy_definition: 'true'
            });
            
            result = { message: 'Tabela criada com SQL direto' };
          } catch (sqlError) {
            console.error('Erro ao criar tabela com SQL:', sqlError);
            return res.status(500).json({
              success: false,
              error: 'Não foi possível criar a tabela',
              details: sqlError
            });
          }
        } else {
          result = { message: 'Tabela criada com insert direto', data: directResult };
        }
      } else {
        result = { message: 'Tabela criada com função RPC', data: createResult };
      }
    } else {
      // Adicionar colunas que possam estar faltando
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'appointments');
      
      if (columnsError) {
        console.error('Erro ao verificar colunas:', columnsError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao verificar colunas',
          details: columnsError
        });
      }
      
      const columnNames = columns.map(col => col.column_name);
      const missingColumns = [];
      
      // Verificar colunas que faltam
      const requiredColumns = [
        'client_id', 'client_initials', 'client_avatar', 
        'service_id', 'service_duration', 'notes'
      ];
      
      for (const col of requiredColumns) {
        if (!columnNames.includes(col)) {
          missingColumns.push(col);
          
          // Adicionar a coluna faltante
          try {
            await supabase.rpc('add_column', {
              table_name: 'appointments',
              column_name: col,
              column_type: col === 'service_duration' ? 'INTEGER' : 'TEXT'
            });
          } catch (addError) {
            console.error(`Erro ao adicionar coluna ${col}:`, addError);
          }
        }
      }
      
      // Verificar colunas em camelCase que precisam ser renomeadas
      const camelCaseColumns = [
        { old: 'clientId', new: 'client_id' },
        { old: 'clientInitials', new: 'client_initials' },
        { old: 'clientAvatar', new: 'client_avatar' },
        { old: 'serviceId', new: 'service_id' },
        { old: 'serviceDuration', new: 'service_duration' },
        { old: 'endTime', new: 'end_time' }
      ];
      
      for (const col of camelCaseColumns) {
        if (columnNames.includes(col.old)) {
          try {
            // Verificar se a coluna nova já existe
            if (columnNames.includes(col.new)) {
              // Copiar dados e depois remover a coluna antiga
              await supabase.rpc('execute_sql', {
                sql: `UPDATE public.appointments SET "${col.new}" = "${col.old}"`
              });
              
              await supabase.rpc('drop_column', {
                table_name: 'appointments',
                column_name: col.old
              });
            } else {
              // Renomear a coluna
              await supabase.rpc('rename_column', {
                table_name: 'appointments',
                old_name: col.old,
                new_name: col.new
              });
            }
          } catch (renameError) {
            console.error(`Erro ao renomear coluna ${col.old}:`, renameError);
          }
        }
      }
      
      result = { 
        message: 'Tabela já existe', 
        missingColumns: missingColumns.length > 0 ? `Adicionadas colunas: ${missingColumns.join(', ')}` : 'Nenhuma coluna adicionada' 
      };
    }
    
    // Verificar a estrutura final da tabela
    const { data: finalColumns, error: finalError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'appointments');
    
    return res.status(200).json({
      success: true,
      message: 'Operação concluída com sucesso',
      result,
      columns: finalColumns || []
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error
    });
  }
} 
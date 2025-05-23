import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Starting fix-transactions-table endpoint');
    
    // SQL to add notes column if it doesn't exist
    const sql = `
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS notes TEXT;
    `;
    console.log('SQL query to execute:', sql);
    
    // First check if exec_sql function exists
    try {
      console.log('Checking if exec_sql function exists...');
      // Não podemos verificar diretamente a existência da função no banco de dados
      // através do cliente JS do Supabase, então vamos tentar usar diretamente
      
      // Execute the SQL to fix transactions table
      console.log('Attempting to execute SQL using exec_sql RPC');
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('Error fixing transactions table:', error);
        
        // Se falhou, provavelmente a função exec_sql não existe
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to fix transactions table. Please run the setup procedure first.', 
          error: error.message || 'Unknown error',
          manualSetupRequired: true,
          sqlToRun: sql
        }, { status: 500 });
      }
      
      console.log('Successfully fixed transactions table');
      return NextResponse.json({ 
        success: true, 
        message: 'Transactions table fixed successfully' 
      });
    } catch (error: any) {
      console.error('Error executing SQL:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fix transactions table', 
        error: error.message || 'Unknown error',
        manualSetupRequired: true,
        sqlToRun: sql
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error in fix-transactions-table:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fixing transactions table', 
      error: error.message || 'Unknown error',
      details: typeof error === 'object' ? JSON.stringify(error) : null
    }, { status: 500 });
  }
} 
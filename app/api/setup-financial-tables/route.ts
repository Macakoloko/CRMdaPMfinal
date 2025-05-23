import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting setup-financial-tables endpoint');
    
    // Read the SQL script
    const scriptPath = path.join(process.cwd(), 'scripts', 'create-financial-tables.sql');
    console.log('Script path:', scriptPath);
    
    if (!fs.existsSync(scriptPath)) {
      console.error('SQL script file not found:', scriptPath);
      return NextResponse.json({ 
        success: false, 
        message: 'SQL script file not found', 
        path: scriptPath 
      }, { status: 404 });
    }
    
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');
    console.log('SQL script loaded, length:', sqlScript.length);
    
    // Execute the SQL script using exec_sql RPC
    console.log('Attempting to execute SQL script using exec_sql RPC');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    console.log('RPC response:', { data, error: error ? JSON.stringify(error) : null });
    
    if (error) {
      console.error('Error executing SQL script:', error);
      
      // Se a função exec_sql não existe, precisamos fornecer instruções para configuração manual
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to set up financial tables. You need to set up the stored procedure first.', 
        error: error.message || 'Unknown error',
        manualSetupRequired: true,
        scriptContent: sqlScript
      }, { status: 500 });
    }
    
    console.log('Financial tables set up successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Financial tables set up successfully' 
    });
  } catch (error: any) {
    console.error('Unexpected error in setup-financial-tables:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while setting up financial tables', 
      error: error.message || 'Unknown error',
      details: typeof error === 'object' ? JSON.stringify(error) : null
    }, { status: 500 });
  }
} 
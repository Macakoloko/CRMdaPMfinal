import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting setup-stored-procedure endpoint');
    
    // Read the SQL script
    const scriptPath = path.join(process.cwd(), 'scripts', 'create-stored-procedure.sql');
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
    console.log('SQL script loaded:', sqlScript.substring(0, 100) + '...');
    
    // Try to execute the SQL script using exec_sql RPC if it exists
    try {
      console.log('Attempting to execute SQL script using exec_sql RPC');
      const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('Error using exec_sql RPC:', error);
        throw error;
      }
      
      console.log('Stored procedure set up successfully using RPC');
    } catch (rpcError: any) {
      // If exec_sql doesn't exist yet, we need to execute the script directly
      console.error('Failed to use exec_sql RPC:', rpcError);
      
      // Since direct SQL execution is not available in the Supabase JS client,
      // we need to provide instructions for manual setup
      console.log('Direct SQL execution not available in Supabase JS client');
      
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to set up stored procedure. Please run the script manually in the Supabase SQL editor.', 
        error: rpcError.message || 'Unknown error',
        manualSetupRequired: true,
        scriptContent: sqlScript
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stored procedure set up successfully' 
    });
  } catch (error: any) {
    console.error('Unexpected error in setup-stored-procedure:', error);
    
    // Try to provide more helpful error information
    let errorMessage = error.message || 'Unknown error';
    let errorDetails = null;
    
    if (error.details) {
      errorDetails = error.details;
    } else if (typeof error === 'object') {
      errorDetails = JSON.stringify(error);
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while setting up stored procedure', 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
} 
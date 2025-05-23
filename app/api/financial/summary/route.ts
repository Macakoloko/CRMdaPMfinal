import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/financial/summary
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Query para buscar transações agrupadas por dia
    const query = supabase
      .from('daily_summary')
      .select('*');
    
    if (startDate) {
      query.gte('date', startDate);
    }
    
    if (endDate) {
      query.lte('date', endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) {
      // Se a tabela não existir, retorna um array vazio
      if (error.code === '42P01') {
        return NextResponse.json([]);
      }
      
      console.error('Error fetching financial summary:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error: unknown) {
    console.error('Error in financial summary API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
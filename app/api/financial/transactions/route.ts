import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/financial/transactions
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    let query = supabase.from('transactions').select('*');
    
    // Apply filters if provided
    if (type) {
      query = query.eq('type', type);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Execute query and order by date (most recent first)
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/financial/transactions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['type', 'category', 'amount', 'date', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Format the data for Supabase
    const transactionData = {
      id: body.id || crypto.randomUUID(),
      type: body.type,
      category: body.category,
      amount: body.amount,
      date: new Date(body.date).toISOString(),
      description: body.description,
      related_appointment_id: body.relatedAppointmentId,
      related_client_id: body.relatedClientId,
      payment_method: body.paymentMethod,
      notes: body.notes
    };
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select();
    
    if (error) {
      console.error('Error creating transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
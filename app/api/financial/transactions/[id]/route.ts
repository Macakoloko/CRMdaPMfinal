import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/financial/transactions/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/financial/transactions/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Format the data for Supabase
    const transactionData: any = {};
    
    // Only include fields that are provided
    if (body.type) transactionData.type = body.type;
    if (body.category) transactionData.category = body.category;
    if (body.amount !== undefined) transactionData.amount = body.amount;
    if (body.date) transactionData.date = new Date(body.date).toISOString();
    if (body.description) transactionData.description = body.description;
    if (body.relatedAppointmentId !== undefined) transactionData.related_appointment_id = body.relatedAppointmentId;
    if (body.relatedClientId !== undefined) transactionData.related_client_id = body.relatedClientId;
    if (body.paymentMethod !== undefined) transactionData.payment_method = body.paymentMethod;
    if (body.notes !== undefined) transactionData.notes = body.notes;
    
    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data: data[0] });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/financial/transactions/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
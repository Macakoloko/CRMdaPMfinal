import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH update product stock
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, quantity } = body;
    
    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'ID do produto e quantidade são obrigatórios' }, 
        { status: 400 }
      );
    }
    
    // First, get the current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('estoque')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching product stock:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    
    // Calculate new stock value
    const currentStock = parseInt(product.estoque);
    const newStock = currentStock + parseInt(quantity);
    
    // Update the stock
    const { data, error } = await supabase
      .from('products')
      .update({
        estoque: newStock.toString(),
        dataAtualizacao: new Date().toISOString(),
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating product stock:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Error in products stock API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
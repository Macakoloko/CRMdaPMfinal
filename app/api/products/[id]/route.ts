import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET a single product by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }
      console.error('Error fetching product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH update a product
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('products')
      .update({
        nome: body.nome,
        descricao: body.descricao || null,
        preco: body.preco,
        custo: body.custo,
        estoque: body.estoque,
        estoqueMinimo: body.estoqueMinimo || '5',
        categoria: body.categoria,
        fornecedor: body.fornecedor || null,
        codigoBarras: body.codigoBarras || null,
        dataAtualizacao: new Date().toISOString(),
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // First try to get products
    let query = supabase.from('products').select('*');
    
    if (category) {
      query = query.eq('categoria', category);
    }
    
    const { data, error } = await query;
    
    // If table doesn't exist, try to create it
    if (error && error.code === '42P01') {
      console.log('Products table does not exist, attempting to create it');
      
      // Call our setup endpoint to create the table
      const setupResponse = await fetch(new URL('/api/products/setup', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (setupResponse.ok) {
        console.log('Products table created successfully!');
        // Return empty array since the table was just created
        return NextResponse.json([]);
      } else {
        const errorData = await setupResponse.json();
        console.error('Failed to create products table:', errorData);
        return NextResponse.json({ error: 'Tabela de produtos não encontrada e não foi possível criá-la automaticamente' }, { status: 500 });
      }
    }
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Filter for low stock if requested
    let result = data || [];
    if (lowStock === 'true' && result.length > 0) {
      result = result.filter(product => 
        parseInt(product.estoque) <= parseInt(product.estoqueMinimo)
      );
    }
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create a simple product object with only essential fields
    const productData: Record<string, any> = { 
      nome: body.nome || 'Produto Sem Nome',
      preco: body.preco || '0.00',
      custo: body.custo || '0.00',
      estoque: body.estoque || '0',
      categoria: body.categoria || 'outro'
    };
    
    // Try to insert the product with minimal fields first
    let { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    
    // If table doesn't exist, try to create it
    if (error && error.code === '42P01') {
      console.log('Products table does not exist, creating it...');
      
      // Call our setup endpoint to create the table
      const setupResponse = await fetch(new URL('/api/products/setup', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!setupResponse.ok) {
        const errorData = await setupResponse.json();
        console.error('Failed to create products table:', errorData);
        return NextResponse.json({ 
          error: 'Falha ao criar tabela de produtos automaticamente',
          message: 'A tabela de produtos não existe e não foi possível criá-la automaticamente.'
        }, { status: 500 });
      }
      
      console.log('Products table created successfully! Trying to insert product again...');
      
      // Try inserting again after table creation
      const result = await supabase
        .from('products')
        .insert([{
          ...productData,
          estoqueMinimo: body.estoqueMinimo || '5',
          descricao: body.descricao || null,
          fornecedor: body.fornecedor || null,
          codigoBarras: body.codigoBarras || null,
          dataAtualizacao: new Date().toISOString(),
          vendas: 0
        }])
        .select();
      
      data = result.data;
      error = result.error;
    }
    
    // Handle schema cache error
    if (error && error.message && (
      error.message.includes('schema cache') || 
      error.message.includes('column') || 
      error.message.includes('not found')
    )) {
      console.log('Schema cache error:', error.message);
      
      // Try to update the schema cache by executing a simple query first
      await supabase.from('products').select('*').limit(1);
      
      // Now try again with a more complete product object
      const completeProductData: Record<string, any> = { 
        ...productData,
        descricao: body.descricao || null,
        estoqueMinimo: body.estoqueMinimo || '5',
        fornecedor: body.fornecedor || null,
        codigoBarras: body.codigoBarras || null,
        dataAtualizacao: new Date().toISOString(),
        vendas: 0
      };
      
      const { data: completeData, error: completeError } = await supabase
        .from('products')
        .insert([completeProductData])
        .select();
      
      if (completeError) {
        console.error('Error with complete product object:', completeError);
        
        // If that still fails, try with absolute minimal fields
        const minimalData: Record<string, any> = { 
          nome: body.nome || 'Produto Sem Nome',
          preco: body.preco || '0.00',
          categoria: body.categoria || 'outro'
        };
        
        const { data: minData, error: minError } = await supabase
          .from('products')
          .insert([minimalData])
          .select();
        
        if (minError) {
          console.error('Error with minimal product object:', minError);
          return NextResponse.json({ 
            error: minError.message,
            message: 'Erro ao adicionar produto. Por favor, verifique se a tabela de produtos está configurada corretamente seguindo as instruções no README.md.'
          }, { status: 500 });
        }
        
        data = minData;
      } else {
        data = completeData;
      }
      
      error = null;
    }
    
    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ 
        error: error.message,
        message: 'Erro ao adicionar produto. Por favor, verifique se a tabela de produtos está configurada corretamente seguindo as instruções no README.md.'
      }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No data returned',
        message: 'Nenhum dado retornado ao adicionar produto. Por favor, verifique se a tabela de produtos está configurada corretamente.'
      }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Error in products API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: 'Erro interno do servidor. Por favor, tente novamente mais tarde.'
    }, { status: 500 });
  }
} 
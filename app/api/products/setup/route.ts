import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Usar a API REST direta do Supabase em vez de RPC
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    console.log('Tentando criar tabela de produtos via API REST...');
    
    // Primeiro, verificar se a tabela já existe
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (!error) {
        // A tabela já existe
        console.log('A tabela de produtos já existe!');
        return NextResponse.json({ 
          success: true, 
          message: 'A tabela de produtos já existe!' 
        });
      }
    } catch (checkError) {
      console.log('Erro ao verificar tabela:', checkError);
      // Continuar com a criação da tabela
    }
    
    // Criar a tabela usando POST para inserir um produto inicial
    try {
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nome: 'Produto Inicial',
          descricao: 'Produto para inicializar a tabela',
          preco: '10.00',
          custo: '5.00',
          estoque: '10',
          estoqueMinimo: '5',
          categoria: 'outro',
          dataAtualizacao: new Date().toISOString(),
          vendas: 0
        })
      });
      
      if (createResponse.ok) {
        console.log('Tabela de produtos criada com sucesso via inserção direta!');
        return NextResponse.json({ 
          success: true, 
          message: 'Tabela de produtos inicializada com sucesso!' 
        });
      } else {
        const responseText = await createResponse.text();
        console.error('Erro ao criar tabela via inserção direta:', responseText);
        
        // Se falhar, tentar criar a tabela usando a API de definição de tabela
        const sqlQuery = `
          -- Create UUID extension if it doesn't exist
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          -- Drop existing table if it exists (with CASCADE to drop dependent objects)
          DROP TABLE IF EXISTS products CASCADE;
          
          -- Create products table with all required columns
          CREATE TABLE products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nome TEXT NOT NULL,
            descricao TEXT,
            preco TEXT NOT NULL,
            custo TEXT NOT NULL,
            estoque TEXT NOT NULL,
            estoqueMinimo TEXT NOT NULL DEFAULT '5',
            categoria TEXT NOT NULL,
            fornecedor TEXT,
            codigoBarras TEXT,
            dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            vendas INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Insert a test product to ensure the table is properly initialized
          INSERT INTO products (
            nome, 
            descricao, 
            preco, 
            custo, 
            estoque, 
            estoqueMinimo, 
            categoria
          ) VALUES (
            'Produto Teste', 
            'Produto para inicializar a tabela', 
            '10.00', 
            '5.00', 
            '10', 
            '5', 
            'outro'
          );
        `;
        
        console.log('SQL para execução manual:', sqlQuery);
        
        return NextResponse.json({ 
          error: 'Falha ao criar tabela de produtos', 
          message: 'Por favor, execute o SQL manualmente no painel do Supabase',
          sql: sqlQuery
        }, { status: 500 });
      }
    } catch (insertError: any) {
      console.error('Erro com abordagem de inserção direta:', insertError);
      
      return NextResponse.json({ 
        error: 'Falha ao criar tabela de produtos', 
        message: 'Por favor, execute o SQL manualmente no painel do Supabase',
        details: insertError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro ao configurar tabela:', error);
    
    return NextResponse.json({ 
      error: error.message, 
      message: 'Por favor, crie a tabela manualmente usando o SQL no README.md' 
    }, { status: 500 });
  }
} 
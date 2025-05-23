import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // SQL para criar a tabela de produtos
    const sql = `
      CREATE TABLE IF NOT EXISTS products (
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
      
      -- Função para obter o estoque mínimo
      CREATE OR REPLACE FUNCTION get_estoque_minimo()
      RETURNS TEXT AS $$
      BEGIN
        RETURN '5';
      END;
      $$ LANGUAGE plpgsql;
      
      -- Trigger para atualizar o timestamp de updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Aplicar o trigger à tabela products
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // Executar o SQL no Supabase
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Erro ao criar tabela de produtos:', error);
      return NextResponse.json(
        { 
          error: `Erro ao criar tabela de produtos: ${error.message}`,
          manualSetupRequired: true,
          scriptContent: sql
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json(
      { 
        error: `Erro interno do servidor: ${error.message}`,
        manualSetupRequired: true
      }, 
      { status: 500 }
    );
  }
} 
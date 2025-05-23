import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // SQL para corrigir possíveis problemas na tabela de produtos
    const sql = `
      -- Verificar e adicionar colunas faltantes
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'descricao') THEN
          ALTER TABLE products ADD COLUMN descricao TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'fornecedor') THEN
          ALTER TABLE products ADD COLUMN fornecedor TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'codigoBarras') THEN
          ALTER TABLE products ADD COLUMN codigoBarras TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'vendas') THEN
          ALTER TABLE products ADD COLUMN vendas INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'created_at') THEN
          ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'updated_at') THEN
          ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
      END $$;
      
      -- Recria a função get_estoque_minimo caso não exista
      CREATE OR REPLACE FUNCTION get_estoque_minimo()
      RETURNS TEXT AS $$
      BEGIN
        RETURN '5';
      END;
      $$ LANGUAGE plpgsql;
      
      -- Recria o trigger de atualização
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // Executar o SQL no Supabase
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Erro ao corrigir tabela de produtos:', error);
      return NextResponse.json(
        { 
          error: `Erro ao corrigir tabela de produtos: ${error.message}`,
          manualSetupRequired: true,
          sqlToRun: sql
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
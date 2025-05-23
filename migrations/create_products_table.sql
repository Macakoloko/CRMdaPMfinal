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

    -- Create function to get products with low stock
    CREATE OR REPLACE FUNCTION get_low_stock_products()
    RETURNS SETOF products AS $$
    BEGIN
    RETURN QUERY
    SELECT *
    FROM products
    WHERE CAST(estoque AS INTEGER) <= CAST(estoqueMinimo AS INTEGER);
    END;
    $$ LANGUAGE plpgsql;

    -- Create function to get estoque minimo value
    CREATE OR REPLACE FUNCTION get_estoque_minimo()
    RETURNS TEXT AS $$
    BEGIN
    RETURN '5';
    END;
    $$ LANGUAGE plpgsql;

    -- Create function to update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger to update the updated_at column
    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
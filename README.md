# Beauty Salon CRM

Um sistema de gestão completo para salões de beleza em Portugal.

## Sobre

Este CRM (Customer Relationship Management) foi desenvolvido especificamente para salões de beleza em Portugal. O sistema permite gerir agendamentos, clientes, produtos, serviços e finanças.

## Características Principais

- **Agendamentos**: Gestão completa de marcações com calendário interativo
- **Clientes**: Base de dados de clientes com histórico de serviços
- **Produtos e Serviços**: Gestão de inventário e catálogo de serviços
- **Finanças**: Controle de receitas, despesas e relatórios financeiros
- **Dashboard**: Visão geral do negócio com métricas importantes

## Importante

- **Uso Exclusivo em Portugal**: Esta aplicação foi desenvolvida exclusivamente para uso em Portugal.
- **Moeda**: Todos os valores são apresentados em Euro (€).
- **Conformidade**: A aplicação segue as normas e regulamentos portugueses.

## Tecnologias

- Next.js
- React
- Tailwind CSS
- Supabase (PostgreSQL)
- TypeScript

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/Macakoloko/CRMdaPMfinal.git

# Entrar no diretório
cd CRMdaPMfinal

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## Configuração

1. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_serviço_do_supabase
   ```

2. Configure as tabelas necessárias no Supabase conforme as instruções abaixo.

## Configuração Inicial

### Banco de Dados

Este projeto utiliza o Supabase como banco de dados. Siga os passos abaixo para configurar as tabelas necessárias:

#### Tabela de Produtos

Se você estiver enfrentando erros como:
- `relation "public.products" does not exist`
- `Could not find the 'codigoBarras' column of 'products' in the schema cache`
- `Could not find the 'estoqueMinimo' column of 'products' in the schema cache`
- `null value in column "custo" of relation "products" violates not-null constraint`
- `cannot drop table products because other objects depend on it`

Siga estas instruções para criar a tabela corretamente:

1. Acesse o painel de administração do Supabase
2. Vá para a seção "SQL Editor"
3. Crie uma nova consulta
4. Cole o seguinte SQL e execute-o:

```sql
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
```

5. Após executar o SQL, reinicie o aplicativo com `npm run dev`
6. **IMPORTANTE**: Limpe o cache do navegador ou use o modo anônimo para evitar problemas com o cache do esquema
7. Se ainda encontrar erros relacionados ao esquema, tente as seguintes soluções:
   - Feche completamente o navegador e abra novamente
   - Reinicie o servidor de desenvolvimento
   - Verifique no painel do Supabase se a tabela foi criada corretamente com todas as colunas

**Importante**: Este script irá *substituir* a tabela de produtos existente se ela já existir. Certifique-se de fazer backup de quaisquer dados importantes antes de executá-lo.

**Nota**: Se você ainda encontrar erros relacionados ao esquema após executar o SQL, verifique se todas as colunas foram criadas corretamente na tabela `products` através do painel do Supabase em "Table Editor".

## Funcionalidades

- Gestão de clientes
- Agendamentos
- Controle financeiro
- Gestão de produtos e serviços
- Chat integrado
- Automações

## Desenvolvimento

### Contribuir para o repositório

```bash
# Adicionar suas alterações
git add .

# Fazer commit das alterações
git commit -m "Descrição das alterações"

# Enviar para o repositório remoto
git push origin main
```

## Licença

Todos os direitos reservados. 
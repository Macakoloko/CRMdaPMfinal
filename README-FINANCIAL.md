# Módulo Financeiro - CRM PEM

Este documento contém instruções para configurar e utilizar o módulo financeiro do CRM PEM.

## Configuração Inicial

Para utilizar o módulo financeiro, é necessário configurar as tabelas no banco de dados Supabase. Existem duas maneiras de fazer isso:

### 1. Através da Interface do CRM

1. Acesse a página de configurações do sistema em `/configuracoes`
2. Vá para a aba **Banco de Dados**
3. Clique no botão "Configurar" na seção "Tabelas Financeiras"
4. Aguarde a confirmação de sucesso

### 2. Manualmente através do Supabase

Se a opção acima não funcionar, você pode configurar manualmente:

1. Na página de configurações (`/configuracoes`), aba **Banco de Dados**, clique em "Ver Instruções Manuais"
2. Siga as instruções apresentadas para executar os comandos SQL necessários
3. Alternadamente, você pode:
   - Acessar o painel do Supabase
   - Ir para a seção "SQL Editor"
   - Criar uma nova consulta
   - Colar o conteúdo do arquivo `scripts/create-financial-tables.sql`
   - Executar a consulta

## Estrutura das Tabelas

### Tabela `transactions`

Esta tabela armazena todas as transações financeiras (receitas e despesas).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único da transação |
| type | TEXT | Tipo de transação ('income' ou 'expense') |
| category | TEXT | Categoria da transação |
| amount | NUMERIC | Valor da transação |
| date | TIMESTAMP | Data da transação |
| description | TEXT | Descrição da transação |
| related_appointment_id | UUID | ID do agendamento relacionado (opcional) |
| related_client_id | UUID | ID do cliente relacionado (opcional) |
| payment_method | TEXT | Método de pagamento |
| notes | TEXT | Observações adicionais |

### Tabela `daily_summaries`

Esta tabela armazena resumos diários das operações financeiras.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único do resumo |
| date | DATE | Data do resumo |
| total_income | NUMERIC | Total de receitas no dia |
| total_expenses | NUMERIC | Total de despesas no dia |
| profit | NUMERIC | Lucro do dia |
| completed_appointments | INTEGER | Número de agendamentos concluídos |
| total_work_hours | NUMERIC | Total de horas trabalhadas |

## Uso do Módulo Financeiro

### Receitas

Na aba "Recebimentos" do módulo financeiro, você pode:

- Registrar novos recebimentos
- Visualizar o histórico de recebimentos
- Editar recebimentos existentes
- Excluir recebimentos

### Despesas

Na aba "Despesas" do módulo financeiro, você pode:

- Registrar novas despesas
- Marcar despesas como recorrentes
- Visualizar o histórico de despesas
- Editar despesas existentes
- Excluir despesas

### Relatórios

Na aba "Relatório" do módulo financeiro, você pode:

- Visualizar gráficos de receitas x despesas
- Filtrar por período (mês, trimestre, ano)
- Ver resumo financeiro do mês atual
- Analisar categorias de receitas e despesas

## Solução de Problemas

Se você encontrar o erro "Could not find the 'notes' column of 'transactions'", isso indica que a tabela `transactions` foi criada sem a coluna `notes`. Para resolver:

1. Acesse a página de configuração em `/setup`
2. Execute o script de configuração das tabelas financeiras
3. Ou execute manualmente o seguinte comando SQL no Supabase:

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT;
```

## Categorias Disponíveis

### Receitas
- Serviço
- Produto
- Pacote
- Assinatura
- Outro

### Despesas
- Aluguel
- Salários
- Insumos
- Equipamentos
- Marketing
- Utilities
- Impostos
- Manutenção
- Outro 
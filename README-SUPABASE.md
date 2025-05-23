# Supabase Integration

Este projeto utiliza o Supabase como backend para armazenamento de dados.

## Configuração

1. Crie uma conta no [Supabase](https://supabase.com/) e um novo projeto.

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://aribaiysmgwwyoemdyxr.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyaWJhaXlzbWd3d3lvZW1keXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjczODksImV4cCI6MjA1ODYwMzM4OX0.yoD85sSedTiy254-IFPpGTL2W1AYW5BFsrBPQ7ZqJjU
     ```

3. Crie as tabelas necessárias no Supabase:
   - Acesse o painel do Supabase
   - Vá para a seção SQL Editor
   - Execute os scripts SQL localizados em:
     - `scripts/create-supabase-tables.sql` (para agendamentos)
     - `scripts/create-financial-tables.sql` (para finanças)

## Estrutura de Dados

### Tabela de Agendamentos (appointments)

| Coluna          | Tipo                     | Descrição                     |
|-----------------|--------------------------|-------------------------------|
| id              | UUID                     | ID único do agendamento       |
| title           | TEXT                     | Título do agendamento         |
| start           | TIMESTAMP WITH TIME ZONE | Data/hora de início           |
| end_time        | TIMESTAMP WITH TIME ZONE | Data/hora de término          |
| client          | TEXT                     | Nome do cliente               |
| clientId        | TEXT                     | ID do cliente                 |
| clientAvatar    | TEXT                     | URL do avatar do cliente      |
| clientInitials  | TEXT                     | Iniciais do cliente           |
| service         | TEXT                     | Nome do serviço               |
| serviceId       | TEXT                     | ID do serviço                 |
| serviceDuration | INTEGER                  | Duração do serviço em minutos |
| notes           | TEXT                     | Observações                   |
| status          | TEXT                     | Status do agendamento         |
| color           | TEXT                     | Cor do agendamento            |
| created_at      | TIMESTAMP WITH TIME ZONE | Data de criação               |
| updated_at      | TIMESTAMP WITH TIME ZONE | Data de atualização           |

### Tabela de Transações (transactions)

| Coluna               | Tipo                     | Descrição                       |
|----------------------|--------------------------|----------------------------------|
| id                   | UUID                     | ID único da transação           |
| type                 | TEXT                     | Tipo (income/expense)           |
| category             | TEXT                     | Categoria da transação          |
| amount               | NUMERIC(10,2)            | Valor da transação              |
| date                 | TIMESTAMP WITH TIME ZONE | Data/hora da transação          |
| description          | TEXT                     | Descrição da transação          |
| related_appointment_id | UUID                   | ID do agendamento relacionado   |
| related_client_id    | UUID                     | ID do cliente relacionado       |
| payment_method       | TEXT                     | Método de pagamento             |
| created_at           | TIMESTAMP WITH TIME ZONE | Data de criação                 |
| updated_at           | TIMESTAMP WITH TIME ZONE | Data de atualização             |

### Tabela de Resumos Diários (daily_summaries)

| Coluna                | Tipo                     | Descrição                       |
|-----------------------|--------------------------|----------------------------------|
| id                    | UUID                     | ID único do resumo              |
| date                  | DATE                     | Data do resumo                  |
| total_income          | NUMERIC(10,2)            | Total de receitas do dia        |
| total_expenses        | NUMERIC(10,2)            | Total de despesas do dia        |
| profit                | NUMERIC(10,2)            | Lucro do dia                    |
| completed_appointments | INTEGER                 | Agendamentos concluídos no dia  |
| total_work_hours      | NUMERIC(5,2)             | Total de horas trabalhadas      |
| created_at            | TIMESTAMP WITH TIME ZONE | Data de criação                 |
| updated_at            | TIMESTAMP WITH TIME ZONE | Data de atualização             |

## Uso no Código

O Supabase é integrado através do contexto `SupabaseContext` e pode ser utilizado em qualquer componente com o hook `useSupabase()`:

```tsx
import { useSupabase } from "@/context/SupabaseContext";

function MeuComponente() {
  const { supabase } = useSupabase();
  
  async function buscarDados() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*');
      
    if (error) {
      console.error("Erro:", error);
      return;
    }
    
    console.log("Dados:", data);
  }
  
  return (
    <button onClick={buscarDados}>Buscar Dados</button>
  );
}
```

## Contextos Integrados

Os seguintes contextos já estão integrados com o Supabase:

1. **AppointmentContext** - Gerencia agendamentos
   - Tabela: `appointments`
   - Hook: `useAppointments()`

2. **FinancialContext** - Gerencia transações financeiras
   - Tabelas: `transactions` e `daily_summaries`
   - Hook: `useFinancial()` 
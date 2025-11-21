# Padrão Arquitetural para Analytics e Relatórios (RPC Pattern)

Este documento estabelece o padrão arquitetural para a implementação de Dashboards e Relatórios em novos módulos do RegiFlex, como o módulo de Odontologia. O padrão é centrado no uso de **Funções de Chamada de Procedimento Remoto (RPC)** do PostgreSQL no Supabase para garantir eficiência, segurança e escalabilidade.

## 1. Princípio Arquitetural

A lógica pesada de agregação e cálculo de métricas deve ser executada no banco de dados (PostgreSQL), mantendo o frontend (React) e as Edge Functions (Deno/TS) leves e focados na apresentação e na lógica de negócio de baixo nível.

## 2. Estrutura do Padrão RPC

### 2.1. Backend (Supabase/PostgreSQL)

O coração do sistema de analytics é a função RPC.

| Componente | Localização Padrão | Exemplo (Psicologia) | Descrição |
| :--- | :--- | :--- | :--- |
| **Função RPC** | `supabase/sql/relatorio_<modulo>.sql` | `relatorio_agregado.sql` | Uma função SQL que recebe parâmetros de filtro (datas, IDs, etc.) e retorna um objeto JSONB contendo todas as métricas agregadas necessárias para o frontend. |
| **Tabelas de Dados** | `public.<tabela_principal>` | `sessoes` | As tabelas que contêm os dados brutos a serem analisados. |
| **Segurança** | Políticas RLS | RLS na tabela `sessoes` | **Crucial:** A função RPC deve ser escrita de forma a respeitar o **Row Level Security (RLS)**. Se a função for `SECURITY DEFINER`, ela deve incluir explicitamente o `tenant_id` na cláusula `WHERE` para filtrar os dados. Se for `SECURITY INVOKER`, o RLS da tabela subjacente deve ser suficiente. **Recomendação:** Usar `SECURITY INVOKER` e garantir que as políticas RLS estejam ativas nas tabelas. |

**Exemplo de Adaptação para Odontologia:**

Para o módulo de Odontologia, a função RPC deve ser adaptada para as métricas relevantes:

1.  **Nome da Função:** `get_aggregated_report_odontologia`
2.  **Tabelas:** Em vez de `sessoes`, pode usar `procedimentos` ou `tratamentos`.
3.  **Métricas:**
    *   Contagem de `procedimentos` realizados (em vez de `sessoes`).
    *   Soma do `faturamento` (em vez de `total_sessoes`).
    *   Taxa de `conclusão de tratamento` (em vez de `taxa_comparecimento`).

### 2.2. Frontend (React)

O frontend deve ser genérico e reutilizar componentes de visualização.

| Componente | Localização Padrão | Descrição |
| :--- | :--- | :--- |
| **Componente de Relatório** | `frontend/src/components/Relatorios.jsx` | Componente principal que gerencia o estado dos filtros e chama a API. Deve ser adaptado para chamar a RPC específica do módulo. |
| **Componentes de Visualização** | `frontend/src/components/ui/*.jsx` | Componentes reutilizáveis (ex: `KeyStats`, `BarChart`, `PieChart`) que recebem os dados formatados do RPC e os exibem. |
| **Serviço de API** | `frontend/src/services/supabaseApi.js` | Deve ter uma função genérica para chamar a RPC (ex: `supabase.rpc('get_aggregated_report_odontologia', { ...filtros })`). |

## 3. Padrão de IA (Inferência Matemática)

Para a IA, o padrão é a **Inferência Matemática no Edge** com pesos armazenados no DB.

1.  **Treinamento (Python):** O script de treinamento (`analysis.py`) deve ser modificado para extrair os coeficientes (`feature_weights` e `intercept`) e salvá-los na tabela `model_parameters` com o `module_name` correspondente (ex: 'odontologia').
2.  **Inferência (Edge Function):** A Edge Function (`predict-no-show/index.ts`) deve ser duplicada para o novo módulo (ex: `predict-procedimento-complexo/index.ts`). Esta função deve:
    *   Buscar os pesos na tabela `model_parameters` usando o `module_name`.
    *   Aplicar a fórmula matemática do modelo (ex: Regressão Logística, `sigmoid(z)`) para calcular a probabilidade.
    *   **Vantagem:** Isso garante que a lógica de IA seja sempre atualizada dinamicamente pelo treinamento em Python, sem a necessidade de re-deploy da Edge Function.

## 4. Checklist de Implementação para Novo Módulo

| Passo | Descrição | Arquivos Envolvidos |
| :--- | :--- | :--- |
| **1. Dados** | Garantir que as tabelas do novo módulo tenham RLS ativado. | `supabase/schema.sql` |
| **2. RPC** | Criar a função RPC SQL para agregação de métricas do novo módulo. | `supabase/sql/relatorio_<modulo>.sql` |
| **3. IA Treinamento** | Criar o script Python para treinar o modelo e salvar os coeficientes no DB. | `analysis_<modulo>.py` |
| **4. IA Inferência** | Criar a Edge Function para inferência, buscando os coeficientes e aplicando a fórmula. | `supabase/functions/predict_<metrica>/index.ts` |
| **5. Frontend** | Adaptar o `Relatorios.jsx` e `IA.jsx` para chamar as novas funções e exibir os resultados. | `frontend/src/components/*.jsx` |

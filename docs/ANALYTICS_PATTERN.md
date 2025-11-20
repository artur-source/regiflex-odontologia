# Padrão Arquitetural RPC para Analytics (RegiFlex)

## 1. Princípio do Padrão RPC

O padrão RPC (Remote Procedure Call) para analytics centraliza a lógica de agregação e cálculo de métricas no banco de dados (PostgreSQL/Supabase). O frontend chama uma função de banco de dados (RPC) que retorna um objeto JSONB pré-calculado, mantendo o frontend leve e o processamento de dados eficiente.

## 2. Aplicação no Módulo Odontologia

Para o módulo Odontologia, este padrão deve ser aplicado da seguinte forma:

### 2.1. Função RPC de Agregação (Backend - SQL)

Uma nova função RPC deve ser criada para calcular as métricas específicas da Odontologia.

*   **Nome Sugerido:** `get_aggregated_report_odontologia`
*   **Retorno:** `JSONB`
*   **Métricas a Calcular:**
    *   `total_pacientes`
    *   `total_procedimentos`
    *   `faturamento_total` (soma de `odontologia_faturamento.valor_total`)
    *   `procedimentos_por_tipo` (agregação por `odontologia_procedimentos.tipo_procedimento`)
    *   `status_odontograma` (contagem de dentes com status 'carie', 'restaurado', 'saudavel').

### 2.2. Implementação no Frontend (UI)

O componente de relatórios do módulo Odontologia (`Relatorios.jsx`) deve chamar esta nova função RPC, seguindo o padrão do módulo Psicologia.

*   **Componentes Reutilizáveis:** `KeyStats`, `StatusChart` e `SessionTypeChart` (adaptado para `ProcedureTypeChart`) podem ser reutilizados, pois consomem o formato JSONB padronizado.

## 3. Padrão de IA (Inferência Matemática)

A lógica de IA deve seguir o novo padrão de inferência matemática:

1.  **Tabela de Parâmetros:** A tabela `model_parameters` armazena os coeficientes (`feature_weights` JSONB) e o `intercept` do modelo de IA treinado (ex: para predição de sucesso de tratamento).
2.  **Edge Function:** A Edge Function (ex: `predict-treatment-success`) busca esses parâmetros e aplica a fórmula matemática (ex: Sigmoid) para calcular a probabilidade, garantindo que a inferência seja rápida e baseada em pesos reais.

Este padrão garante a modularidade e a coerência arquitetural em toda a plataforma RegiFlex.

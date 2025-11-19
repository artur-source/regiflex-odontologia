# Plano de Testes do Módulo RegiFlex Odontologia

## 1. Testes de Segurança e Isolamento (RLS)

| Caso de Teste | Descrição | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **RLS-001 (SELECT)** | Usuário A tenta consultar a tabela `odontologia_pacientes`. | Apenas os pacientes com o `tenant_id` de A são retornados. | PENDENTE |
| **RLS-002 (INSERT)** | Usuário A tenta inserir um paciente com o `tenant_id` de B. | Inserção é negada (erro de RLS). | PENDENTE |
| **RLS-003 (UPDATE)** | Usuário A tenta atualizar um procedimento com o `tenant_id` de B. | Atualização é negada (erro de RLS). | PENDENTE |
| **RLS-004 (DELETE)** | Usuário A tenta deletar um agendamento com o `tenant_id` de B. | Deleção é negada (erro de RLS). | PENDENTE |

## 2. Testes de Funcionalidade do Banco de Dados

| Caso de Teste | Descrição | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **DB-001 (Pacientes)** | Inserir um novo paciente e verificar se o `tenant_id` e `user_id` são preenchidos corretamente. | Inserção bem-sucedida, campos preenchidos. | PENDENTE |
| **DB-002 (Odontograma)** | Inserir um registro de cárie para um dente específico. | Registro criado na tabela `odontologia_odontograma`. | PENDENTE |
| **DB-003 (Procedimentos)** | Inserir um procedimento e verificar se a chave estrangeira para `paciente_id` é válida. | Inserção bem-sucedida. | PENDENTE |

## 3. Testes de Integração (Edge Functions e Stripe)

| Caso de Teste | Descrição | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **INT-001 (IA)** | Chamar a Edge Function `analyze-dental-image` com uma URL de imagem válida. | Retorno de um JSON com `findings`, `recommendations` e `urgency`. | PENDENTE |
| **INT-002 (Relatório)** | Chamar a Edge Function `generate-dental-report` com um `paciente_id` e período. | Retorno de um JSON com a lista de procedimentos e o `valor_total` calculado. | PENDENTE |
| **INT-003 (Webhook)** | Simular um evento `payment_intent.succeeded` do Stripe. | O status de pagamento na tabela `odontologia_faturamento` é atualizado para 'pago'. | PENDENTE |

## 4. Testes de Frontend (Componentes)

| Caso de Teste | Descrição | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **FE-001 (Pacientes)** | Acessar o componente `Pacientes.jsx`. | Lista de pacientes do tenant é exibida. | PENDENTE |
| **FE-002 (Odontograma)** | Clicar em um dente no `Odontograma.jsx`. | O status do dente é alterado visualmente e a função `updateDente` é chamada. | PENDENTE |
| **FE-003 (IA)** | Fazer upload de um arquivo e clicar em "Analisar Imagem" no `IA.jsx`. | O estado de carregamento é ativado e o resultado da análise simulada é exibido. | PENDENTE |

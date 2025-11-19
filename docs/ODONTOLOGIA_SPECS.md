# Especificações do Módulo RegiFlex Odontologia

## 1. Funcionalidades Principais

### 1.1. Gestão de Pacientes
- **Cadastro:** Formulário completo (dados pessoais, histórico médico, alergias, medicações).
- **Perfil:** Visualização de histórico de procedimentos e pagamentos.
- **Busca:** Por nome, CPF, telefone.

### 1.2. Odontograma Interativo
- **Visualização:** Representação gráfica dos 32 dentes.
- **Anotações:** Marcação de cáries, restaurações, extrações, implantes.
- **Histórico:** Rastreamento de alterações.

### 1.3. Gestão de Procedimentos
- **Registro:** Limpeza, restauração, extração, implante, ortodontia, etc.
- **Tabela:** Preços, duração, materiais utilizados.
- **Histórico:** Registro completo por paciente.

### 1.4. Análise de Imagens Clínicas (IA)
- **Upload:** Radiografias, fotos intraorais/extraorais.
- **Análise Automática:** Uso do modelo Anthropic Claude (via Edge Function) para detectar anomalias.
- **Diagnóstico Assistido:** Sugestão de procedimentos.

### 1.5. Agendamento de Consultas
- **Calendário:** Visualização de horários disponíveis.
- **Notificações:** Lembretes por email/SMS (integração futura com Twilio ou similar).

### 1.6. Faturamento e Relatórios
- **Faturamento:** Integração com Stripe para cobrança de procedimentos.
- **Recibos:** Geração automática em PDF.
- **Relatórios:** Produtividade por procedimento, faturamento mensal.

## 2. Dependências e Integrações

| Componente | Tecnologia | Uso no Módulo Odontologia |
| :--- | :--- | :--- |
| **Core** | `regiflex-core` | Autenticação, UI, RLS, Infraestrutura de Deploy. |
| **Banco de Dados** | Supabase (PostgreSQL) | Armazenamento de dados de pacientes, odontograma, procedimentos. |
| **IA** | Anthropic Claude 3.5 Sonnet | Análise de imagens clínicas (via Edge Function). |
| **Pagamentos** | Stripe | Cobrança de procedimentos e gestão de assinaturas. |
| **Frontend** | React.js, Vite, Tailwind CSS | Interface de usuário. |

## 3. Estrutura de Dados (Supabase)

O módulo utiliza as seguintes tabelas com RLS ativado:
- `odontologia_pacientes`
- `odontologia_odontograma`
- `odontologia_procedimentos`
- `odontologia_imagens`
- `odontologia_agendamentos`
- `odontologia_faturamento`

## 4. Edge Functions Implementadas

- `analyze-dental-image`: Para análise de imagens clínicas.
- `generate-dental-report`: Para geração de relatórios de procedimentos.

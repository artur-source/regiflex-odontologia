# RegiFlex Odontologia

**Módulo Especializado de Gestão Odontológica para o RegiFlex**

Um sistema completo de gestão para consultórios odontológicos, integrado à arquitetura modular do RegiFlex. O módulo inclui gestão de pacientes, odontograma interativo, análise de imagens com IA, agendamento e faturamento.

## 🚀 Características Principais

- **Gestão de Pacientes:** Cadastro completo com histórico médico, alergias e medicações
- **Odontograma Interativo:** Visualização e anotação dos 32 dentes com histórico de alterações
- **Análise de Imagens (IA):** Análise automática de radiografias e fotos clínicas usando Anthropic Claude
- **Agendamento:** Calendário de consultas com confirmação automática
- **Faturamento:** Integração com Stripe para cobrança de procedimentos
- **Relatórios:** Dashboard com métricas de produtividade e faturamento
- **Multi-Tenancy:** Isolamento completo de dados entre clínicas com RLS

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Supabase CLI
- Conta Supabase
- Conta Stripe (para pagamentos)

## 🔧 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/artur-source/regiflex-odontologia.git
cd regiflex-odontologia
```

### 2. Configurar o Backend (Supabase)

```bash
# Fazer login na CLI do Supabase
supabase login

# Vincular ao projeto Supabase
supabase link --project-ref SEU_PROJECT_REF

# Aplicar as migrações do banco de dados
supabase migration up --linked

# Fazer deploy das Edge Functions
supabase functions deploy
```

### 3. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
cp .env.example .env.local

# Preencher as variáveis de ambiente
# VITE_SUPABASE_URL=seu_url_supabase
# VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
regiflex-odontologia/
├── frontend/                          # React.js + Vite
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   │   ├── Pacientes.jsx
│   │   │   ├── Odontograma.jsx
│   │   │   ├── IA.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ...
│   │   ├── services/                 # Serviços de API
│   │   ├── hooks/                    # Custom Hooks
│   │   └── contexts/                 # Contextos React
│   └── package.json
├── database/
│   ├── schema.sql                    # Schema do banco de dados
│   ├── migrations/                   # Migrações SQL
│   └── create_model_parameters_table.sql
├── supabase/
│   ├── functions/                    # Edge Functions
│   │   ├── analyze-dental-image/     # IA para análise de imagens
│   │   └── generate-dental-report/   # Geração de relatórios
│   └── sql/
│       └── relatorio_agregado_odontologia.sql
├── api/                              # Webhooks e APIs
│   └── webhooks/
│       └── stripe.js
└── docs/                             # Documentação
    ├── ODONTOLOGIA_SPECS.md
    ├── SUPABASE_SETUP.md
    ├── STRIPE_SETUP.md
    ├── TESTES.md
    └── ANALYTICS_PATTERN.md
```

## 🧪 Testes

Execute os testes para validar a instalação:

```bash
npm test
```

Casos de teste incluem:
- Segurança e isolamento de dados (RLS)
- Funcionalidades do banco de dados
- Integração com Edge Functions
- Integração com Stripe
- Componentes de Frontend

## 📊 Padrão de Analytics (RPC)

O módulo utiliza o **Padrão RPC** para agregação de dados, centralizando a lógica de processamento no banco de dados PostgreSQL. A função `get_aggregated_report_odontologia` calcula todas as métricas e retorna um objeto JSONB para consumo direto pelo frontend.

Veja `docs/ANALYTICS_PATTERN.md` para mais detalhes.

## 🤖 Integração de IA

A análise de imagens clínicas utiliza o **Anthropic Claude** via Edge Function. A inferência é baseada em coeficientes armazenados na tabela `model_parameters`, garantindo que a IA seja matematicamente correta e atualizada dinamicamente.

## 💳 Integração Stripe

O módulo integra-se ao Stripe para:
- Cobrança de procedimentos individuais
- Planos de assinatura (Starter, Professional, Enterprise)
- Webhooks para atualização de status de pagamento

Veja `docs/STRIPE_SETUP.md` para configuração completa.

## 📚 Documentação

- `docs/ODONTOLOGIA_SPECS.md` - Especificações do módulo
- `docs/SUPABASE_SETUP.md` - Configuração do Supabase
- `docs/STRIPE_SETUP.md` - Configuração do Stripe
- `docs/TESTES.md` - Plano de testes
- `docs/ANALYTICS_PATTERN.md` - Padrão RPC para Analytics

## 🔐 Segurança

- **Multi-Tenancy:** Isolamento completo de dados com RLS
- **LGPD Compliant:** Conformidade com a Lei Geral de Proteção de Dados
- **Autenticação:** Supabase Auth com JWT
- **Criptografia:** Dados em repouso e em trânsito

## 🤝 Contribuindo

Para contribuir, crie um fork do repositório, faça suas alterações e envie um Pull Request.

## 📝 Licença

MIT License - veja LICENSE para detalhes

## 📧 Suporte

Para suporte, abra uma issue no repositório GitHub ou entre em contato através do email de suporte.

---

**Desenvolvido com ❤️ pela equipe RegiFlex**

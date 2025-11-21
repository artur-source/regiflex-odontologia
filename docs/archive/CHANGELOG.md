# Changelog - RegiFlex

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.0.0] - 2025-10-08

### 🚀 Migração Completa para Supabase

#### Adicionado
- Integração completa com Supabase como backend gerenciado
- Cliente Supabase (`@supabase/supabase-js`) no frontend
- Novo serviço de API usando Supabase (`supabaseApi.js`)
- Configuração de variáveis de ambiente para Supabase
- Arquivo `.env.example` com template de configuração
- Tabelas criadas no Supabase: `usuarios`, `pacientes`, `sessoes`, `evolucao`, `logs`

#### Modificado
- **AuthContext:** Refatorado para usar banco de dados Supabase
- **api.js:** Atualizado para usar o novo serviço `supabaseApi`
- **README.md:** Reescrito para refletir a nova arquitetura
- Sistema de autenticação simplificado para testes iniciais

#### Removido
- Dependência do backend Flask
- Necessidade de servidor próprio
- Configuração Docker (substituída por Supabase)

#### Corrigido
- ✅ Eliminados todos os erros de conexão com backend
- ✅ Aplicação totalmente funcional com Supabase
- ✅ Login e CRUD de pacientes validados e testados

### 🎯 Benefícios da Migração

- **Escalabilidade Automática:** O Supabase gerencia toda a infraestrutura
- **Redução de Custos:** Sem necessidade de manter servidores próprios
- **Segurança:** Row Level Security (RLS) nativo do Supabase
- **Real-time:** Capacidade de dados em tempo real (para futuras implementações)
- **Backup Automático:** Gerenciado pelo Supabase

---

## [1.0.0] - 2025-10-07

### Adicionado
- Sistema completo de gestão para clínicas de psicologia
- Backend em Flask com PostgreSQL
- Frontend em React.js com Vite
- Sistema de autenticação com JWT
- Gestão de pacientes e sessões
- Geração de QR Codes
- Dashboard com estatísticas
- Containerização com Docker

### Funcionalidades Principais
- Cadastro e gestão de pacientes
- Agendamento de sessões
- Sistema de autenticação multi-perfil
- Geração de relatórios
- Interface responsiva e moderna


# Diagrama de Relacionamento de Entidades (ERD) - Regiflex Odontologia

Este diagrama reflete a estrutura do banco de dados Supabase para o projeto Regiflex Odontologia, incorporando a arquitetura multi-tenant e as adaptações do modelo de psicologia.

## Adaptações Chave:
- **`psicologo`** foi substituído por **`dentista`** (representado na tabela `profiles`).
- **`sessoes`** foi renomeado para **`agendamentos`**.
- Implementação de **`tenant_id`** (UUID) em todas as tabelas principais para isolamento multi-tenant.

## Estrutura do Banco de Dados

```mermaid
erDiagram
    clinicas {
        uuid id PK
        varchar nome
        varchar cnpj
        text endereco
        varchar telefone
        varchar email
        varchar plano
        varchar status
        timestamptz trial_ends_at
        timestamptz created_at
        timestamptz updated_at
    }

    profiles {
        int4 id PK
        uuid auth_user_id FK "auth.users.id"
        uuid tenant_id FK "clinicas.id"
        varchar username
        varchar email
        varchar password_hash
        varchar role "dentista, recepcionista, admin"
        varchar nome_completo
        bool ativo
        timestamptz created_at
        timestamptz updated_at
    }

    pacientes {
        int4 id PK
        uuid tenant_id FK "clinicas.id"
        varchar nome
        varchar cpf
        date data_nascimento
        varchar telefone
        varchar email
        text historico_medico
        timestamptz created_at
        timestamptz updated_at
    }

    agendamentos {
        int4 id PK
        uuid tenant_id FK "clinicas.id"
        int4 paciente_id FK "pacientes.id"
        int4 dentista_id FK "profiles.id"
        timestamp data_hora
        int4 duracao_minutos
        varchar tipo_procedimento "limpeza, consulta, obturacao, cirurgia, ortodontia, outros"
        varchar status "agendado, no-show, realizado, cancelado"
        text observacoes
        timestamptz created_at
        timestamptz updated_at
    }

    evolucao {
        int4 id PK
        int4 agendamento_id FK "agendamentos.id"
        text conteudo
        timestamptz created_at
        timestamptz updated_at
    }

    logs {
        int4 id PK
        int4 usuario_id FK "profiles.id"
        varchar acao
        text detalhes
        varchar ip_address
        timestamp timestamp
    }

    model_parameters {
        int4 id PK
        varchar parameter_name
        float value
        timestamptz updated_at
    }

    clinicas ||--o{ profiles : "tem"
    clinicas ||--o{ pacientes : "tem"
    clinicas ||--o{ agendamentos : "tem"
    profiles ||--o{ agendamentos : "realiza"
    pacientes ||--o{ agendamentos : "tem"
    agendamentos ||--o{ evolucao : "tem"
    profiles ||--o{ logs : "gera"
```

-- regiflex-odontologia/database/schema.sql

-- O schema do módulo de odontologia assume que as tabelas 'tenants' e 'auth.users'
-- já existem e são gerenciadas pelo regiflex-core e Supabase Auth.

-- 3.1.1. Tabelas Principais (Conforme PROMPT_MESTRE)

-- Tabela: odontologia_pacientes
CREATE TABLE IF NOT EXISTS odontologia_pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  data_nascimento DATE NOT NULL,
  genero VARCHAR(20),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  historico_medico TEXT,
  alergias TEXT,
  medicacoes TEXT,
  status VARCHAR(50) DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, cpf)
);

-- Tabela: odontologia_odontograma
CREATE TABLE IF NOT EXISTS odontologia_odontograma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  paciente_id UUID NOT NULL REFERENCES odontologia_pacientes(id),
  dente_numero INT NOT NULL, -- (1-32)
  status VARCHAR(50), -- 'saudavel', 'carie', 'restaurado', 'extraido', 'implante'
  anotacoes TEXT,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, paciente_id, dente_numero)
);

-- Tabela: odontologia_procedimentos
CREATE TABLE IF NOT EXISTS odontologia_procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  paciente_id UUID NOT NULL REFERENCES odontologia_pacientes(id),
  tipo_procedimento VARCHAR(100) NOT NULL,
  descricao TEXT,
  data_procedimento DATE NOT NULL,
  duracao_minutos INT,
  profissional_id UUID REFERENCES auth.users(id),
  preco DECIMAL(10, 2),
  materiais_utilizados TEXT,
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'realizado',
  data_criacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, paciente_id, data_procedimento, tipo_procedimento)
);

-- Tabela: odontologia_imagens
CREATE TABLE IF NOT EXISTS odontologia_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  paciente_id UUID NOT NULL REFERENCES odontologia_pacientes(id),
  tipo_imagem VARCHAR(50), -- 'radiografia', 'intraoral', 'extraoral'
  url_imagem VARCHAR(500),
  analise_ia TEXT, -- JSON com resultado da análise
  data_upload TIMESTAMP DEFAULT NOW(),
  data_analise TIMESTAMP
);

-- Tabela: odontologia_agendamentos
CREATE TABLE IF NOT EXISTS odontologia_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  paciente_id UUID NOT NULL REFERENCES odontologia_pacientes(id),
  data_hora TIMESTAMP NOT NULL,
  duracao_minutos INT DEFAULT 60,
  profissional_id UUID REFERENCES auth.users(id),
  tipo_consulta VARCHAR(100),
  status VARCHAR(50) DEFAULT 'agendado', -- 'agendado', 'confirmado', 'realizado', 'cancelado'
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, data_hora, profissional_id)
);

-- Tabela: odontologia_faturamento
CREATE TABLE IF NOT EXISTS odontologia_faturamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  paciente_id UUID NOT NULL REFERENCES odontologia_pacientes(id),
  procedimento_id UUID REFERENCES odontologia_procedimentos(id),
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  status_pagamento VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
  data_emissao TIMESTAMP DEFAULT NOW(),
  data_vencimento DATE,
  stripe_payment_id VARCHAR(255),
  observacoes TEXT
);

-- 3.2. Políticas de RLS (Row Level Security)

-- A função get_tenant_id() é assumida como existente no regiflex-core/Supabase

-- Habilitar RLS nas tabelas
ALTER TABLE odontologia_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_odontograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_faturamento ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Acesso total para o tenant_id da sessão
CREATE POLICY "Tenants can view their own odontologia_pacientes" ON odontologia_pacientes
  FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can insert their own odontologia_pacientes" ON odontologia_pacientes
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can update their own odontologia_pacientes" ON odontologia_pacientes
  FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can delete their own odontologia_pacientes" ON odontologia_pacientes
  FOR DELETE USING (tenant_id = get_tenant_id());

CREATE POLICY "Tenants can view their own odontologia_odontograma" ON odontologia_odontograma
  FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can insert their own odontologia_odontograma" ON odontologia_odontograma
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can update their own odontologia_odontograma" ON odontologia_odontograma
  FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can delete their own odontologia_odontograma" ON odontologia_odontograma
  FOR DELETE USING (tenant_id = get_tenant_id());

CREATE POLICY "Tenants can view their own odontologia_procedimentos" ON odontologia_procedimentos
  FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can insert their own odontologia_procedimentos" ON odontologia_procedimentos
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can update their own odontologia_procedimentos" ON odontologia_procedimentos
  FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can delete their own odontologia_procedimentos" ON odontologia_procedimentos
  FOR DELETE USING (tenant_id = get_tenant_id());

CREATE POLICY "Tenants can view their own odontologia_imagens" ON odontologia_imagens
  FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can insert their own odontologia_imagens" ON odontologia_imagens
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can update their own odontologia_imagens" ON odontologia_imagens
  FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can delete their own odontologia_imagens" ON odontologia_imagens
  FOR DELETE USING (tenant_id = get_tenant_id());

CREATE POLICY "Tenants can view their own odontologia_agendamentos" ON odontologia_agendamentos
  FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can insert their own odontologia_agendamentos" ON odontologia_agendamentos
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can update their own odontologia_agendamentos" ON odontologia_agendamentos
  FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can delete their own odontologia_agendamentos" ON odontologia_agendamentos
  FOR DELETE USING (tenant_id = get_tenant_id());

CREATE POLICY "Tenants can view their own odontologia_faturamento" ON odontologia_faturamento
  FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can insert their own odontologia_faturamento" ON odontologia_faturamento
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can update their own odontologia_faturamento" ON odontologia_faturamento
  FOR UPDATE USING (tenant_id = get_tenant_id());
CREATE POLICY "Tenants can delete their own odontologia_faturamento" ON odontologia_faturamento
  FOR DELETE USING (tenant_id = get_tenant_id());

-- 3.3. Índices (Opcional, mas recomendado para performance)
CREATE INDEX idx_odontologia_pacientes_tenant_id ON odontologia_pacientes (tenant_id);
CREATE INDEX idx_odontologia_odontograma_paciente_id ON odontologia_odontograma (paciente_id);
CREATE INDEX idx_odontologia_procedimentos_paciente_id ON odontologia_procedimentos (paciente_id);
CREATE INDEX idx_odontologia_agendamentos_data_hora ON odontologia_agendamentos (data_hora);
CREATE INDEX idx_odontologia_faturamento_status ON odontologia_faturamento (status_pagamento);

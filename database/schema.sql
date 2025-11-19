-- Tabela: odontologia_pacientes
CREATE TABLE odontologia_pacientes (
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
CREATE TABLE odontologia_odontograma (
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
CREATE TABLE odontologia_procedimentos (
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
CREATE TABLE odontologia_imagens (
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
CREATE TABLE odontologia_agendamentos (
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
CREATE TABLE odontologia_faturamento (
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

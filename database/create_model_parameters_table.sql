-- Criação da tabela para armazenar os coeficientes dos modelos de IA
CREATE TABLE IF NOT EXISTS model_parameters (
    module_name TEXT PRIMARY KEY,
    feature_weights JSONB NOT NULL,
    intercept DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona RLS (Row Level Security) para garantir que apenas o serviço de IA possa escrever
-- e que o frontend/edge functions possam ler.
-- Nota: A política de RLS real deve ser configurada no dashboard do Supabase.
-- Este script apenas cria a tabela.

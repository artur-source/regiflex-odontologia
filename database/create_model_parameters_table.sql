-- Tabela: model_parameters
CREATE TABLE model_parameters (
  module_name VARCHAR(50) PRIMARY KEY,
  feature_weights JSONB NOT NULL,
  intercept FLOAT NOT NULL,
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- RLS para a nova tabela (apenas leitura para o serviço)
ALTER TABLE model_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_service_read_model_parameters"
ON model_parameters
FOR SELECT
USING (true); -- Acesso de leitura liberado para a Edge Function

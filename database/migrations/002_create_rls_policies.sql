-- Ativar RLS nas tabelas
ALTER TABLE odontologia_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_odontograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologia_faturamento ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter o tenant_id da sessão
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid
LANGUAGE sql
AS $$
  SELECT current_setting('app.tenant_id')::uuid;
$$;

-- Definir políticas de RLS para todas as tabelas

-- Tabela: odontologia_pacientes
CREATE POLICY "tenant_isolation_select_odontologia_pacientes"
ON odontologia_pacientes
FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_insert_odontologia_pacientes"
ON odontologia_pacientes
FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_update_odontologia_pacientes"
ON odontologia_pacientes
FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_delete_odontologia_pacientes"
ON odontologia_pacientes
FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- Tabela: odontologia_odontograma
CREATE POLICY "tenant_isolation_select_odontologia_odontograma"
ON odontologia_odontograma
FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_insert_odontologia_odontograma"
ON odontologia_odontograma
FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_update_odontologia_odontograma"
ON odontologia_odontograma
FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_delete_odontologia_odontograma"
ON odontologia_odontograma
FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- Tabela: odontologia_procedimentos
CREATE POLICY "tenant_isolation_select_odontologia_procedimentos"
ON odontologia_procedimentos
FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_insert_odontologia_procedimentos"
ON odontologia_procedimentos
FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_update_odontologia_procedimentos"
ON odontologia_procedimentos
FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_delete_odontologia_procedimentos"
ON odontologia_procedimentos
FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- Tabela: odontologia_imagens
CREATE POLICY "tenant_isolation_select_odontologia_imagens"
ON odontologia_imagens
FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_insert_odontologia_imagens"
ON odontologia_imagens
FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_update_odontologia_imagens"
ON odontologia_imagens
FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_delete_odontologia_imagens"
ON odontologia_imagens
FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- Tabela: odontologia_agendamentos
CREATE POLICY "tenant_isolation_select_odontologia_agendamentos"
ON odontologia_agendamentos
FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_insert_odontologia_agendamentos"
ON odontologia_agendamentos
FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_update_odontologia_agendamentos"
ON odontologia_agendamentos
FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_delete_odontologia_agendamentos"
ON odontologia_agendamentos
FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- Tabela: odontologia_faturamento
CREATE POLICY "tenant_isolation_select_odontologia_faturamento"
ON odontologia_faturamento
FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_insert_odontologia_faturamento"
ON odontologia_faturamento
FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_update_odontologia_faturamento"
ON odontologia_faturamento
FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_delete_odontologia_faturamento"
ON odontologia_faturamento
FOR DELETE
USING (tenant_id = get_current_tenant_id());

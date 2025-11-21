-- 1. Estrutura de Tabelas
-- Tabela de Usuários (para autenticação do Supabase)
-- A tabela 'users' é gerenciada pelo Supabase Auth, mas podemos ter uma tabela de perfil.
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  tenant_id uuid -- Chave para o isolamento de dados (Multi-tenancy)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seu próprio perfil." ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tabela de Clientes/Pacientes (dados do negócio)
CREATE TABLE public.pacientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL, -- Chave de isolamento
  nome text NOT NULL,
  email text,
  telefone text,
  data_nascimento date,
  historico jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
-- RLS: Apenas usuários do mesmo tenant podem ver/manipular pacientes
CREATE POLICY "Tenants podem ver seus pacientes." ON public.pacientes
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants podem inserir pacientes." ON public.pacientes
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants podem atualizar pacientes." ON public.pacientes
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants podem deletar pacientes." ON public.pacientes
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Tabela de Agendamentos (para o recurso de IA 'no-show')
CREATE TABLE public.agendamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  paciente_id uuid REFERENCES public.pacientes(id) NOT NULL,
  data_hora timestamp with time zone NOT NULL,
  status text DEFAULT 'agendado'::text NOT NULL, -- agendado, realizado, cancelado, no-show
  previsao_no_show numeric, -- Campo para o resultado da IA
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
-- RLS: Apenas usuários do mesmo tenant podem ver/manipular agendamentos
CREATE POLICY "Tenants podem ver seus agendamentos." ON public.agendamentos
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants podem inserir agendamentos." ON public.agendamentos
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants podem atualizar agendamentos." ON public.agendamentos
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants podem deletar agendamentos." ON public.agendamentos
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Dados de Teste
-- Inserir um tenant de teste (UUID fictício)
INSERT INTO public.profiles (id, full_name, tenant_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin Teste', '00000000-0000-0000-0000-000000000001');

-- Inserir um paciente de teste para o tenant
INSERT INTO public.pacientes (tenant_id, nome, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'João da Silva', 'joao.silva@teste.com');

-- Inserir um agendamento de teste
INSERT INTO public.agendamentos (tenant_id, paciente_id, data_hora, status, previsao_no_show)
VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.pacientes WHERE nome = 'João da Silva' LIMIT 1), now() + interval '1 day', 'agendado', 0.85);

-- 3. Função RPC (Remote Procedure Call) - Exemplo de relatorio_agregado.sql
-- A função de relatorio_agregado já existe, mas vamos garantir que ela seja acessível
-- (O conteúdo real da função deve ser copiado do arquivo existente, mas para fins de inicialização, vamos apenas garantir que o schema base esteja lá)
-- Se o arquivo `supabase/sql/relatorio_agregado.sql` for o conteúdo da função, ele deve ser importado separadamente.

-- FIM DO SCHEMA

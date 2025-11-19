# Guia de Configuração do Supabase para o Módulo Odontologia

## 1. Pré-requisitos
- Supabase CLI instalado.
- Credenciais do projeto Supabase (URL e Chaves) configuradas localmente.

## 2. Aplicação do Schema e RLS

1.  **Navegar para o diretório do módulo:**
    ```bash
    cd regiflex-odontologia
    ```

2.  **Aplicar as migrações do banco de dados:**
    ```bash
    # O arquivo schema.sql e as migrações em database/migrations serão aplicados
    supabase db push
    ```
    *Resultado:* As 6 tabelas (`odontologia_pacientes`, `odontologia_odontograma`, etc.) serão criadas, o RLS será ativado e as políticas de isolamento por `tenant_id` serão aplicadas.

## 3. Deploy das Edge Functions

1.  **Navegar para o diretório do Supabase:**
    ```bash
    cd supabase/functions
    ```

2.  **Fazer o deploy da função de Análise de Imagens:**
    ```bash
    supabase functions deploy analyze-dental-image --no-verify-jwt
    ```
    *Nota:* A flag `--no-verify-jwt` é usada pois a função será chamada internamente ou por um serviço autenticado.

3.  **Fazer o deploy da função de Geração de Relatórios:**
    ```bash
    supabase functions deploy generate-dental-report --no-verify-jwt
    ```

## 4. Teste de Conexão
- Validar que o `supabaseClient.js` do `regiflex-core` consegue se conectar e que as queries do frontend respeitam o RLS.
- **Teste de RLS:** Tentar uma query direta sem o `tenant_id` na sessão deve falhar. Tentar uma query com um `tenant_id` diferente do usuário logado deve retornar 0 resultados.

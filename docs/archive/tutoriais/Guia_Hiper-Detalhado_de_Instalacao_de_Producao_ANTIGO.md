# Guia Hiper-Detalhado de Instalação de Produção do RegiFlex (Do Zero)

Este documento é um guia **hiper-detalhado** e passo a passo para a instalação completa do sistema RegiFlex em um ambiente de produção. Ele é projetado para ser executado por um profissional de TI ou desenvolvedor, cobrindo desde a instalação dos pré-requisitos até o deploy final.

O RegiFlex utiliza o **Supabase** como Backend-as-a-Service (PostgreSQL, Autenticação, Edge Functions) e um frontend baseado em **React.js**.

---

## 1. Instalação dos Pré-requisitos

Antes de iniciar a configuração do RegiFlex, é essencial garantir que as ferramentas necessárias estejam instaladas e configuradas em seu ambiente de trabalho.

### 1.1. Git (Controle de Versão)

O Git é necessário para clonar o repositório do RegiFlex.

| Sistema Operacional | Instruções de Instalação |
| :--- | :--- |
| **macOS** | Instale via Homebrew: `brew install git` |
| **Linux (Debian/Ubuntu)** | Instale via APT: `sudo apt update && sudo apt install git -y` |
| **Windows** | Baixe o instalador em [git-scm.com](https://git-scm.com/download/win) e siga as instruções. |

**Verificação:**
```bash
git --version
```

### 1.2. Node.js e npm (Ambiente de Execução do Frontend)

O Node.js (versão 18 ou superior é recomendada) e o npm (gerenciador de pacotes) são necessários para construir o frontend React.js.

| Sistema Operacional | Instruções de Instalação |
| :--- | :--- |
| **macOS/Windows** | Baixe o instalador LTS (Long-Term Support) em [nodejs.org](https://nodejs.org/en/download) e siga as instruções. O npm será instalado junto. |
| **Linux (Recomendado: NVM)** | Use o Node Version Manager (NVM) para gerenciar versões: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` e depois `nvm install --lts` |

**Verificação:**
```bash
node -v
npm -v
```

### 1.3. Supabase CLI (Ferramenta de Linha de Comando)

A Supabase CLI é crucial para vincular o projeto local ao projeto remoto e aplicar as migrações do banco de dados.

| Sistema Operacional | Instruções de Instalação |
| :--- | :--- |
| **macOS/Linux** | Instale via Homebrew: `brew install supabase/tap/supabase` |
| **Windows** | Baixe o binário mais recente em [GitHub Releases do Supabase CLI](https://github.com/supabase/cli/releases) e adicione-o ao seu PATH. |

**Verificação:**
```bash
supabase --version
```

---

## 2. Configuração do Backend (Supabase)

O RegiFlex utiliza o Supabase para banco de dados (PostgreSQL), autenticação e Edge Functions.

### 2.1. Criação do Novo Projeto Supabase (Passo a Passo no Dashboard)

1.  Acesse o **Dashboard do Supabase** e clique em **"New Project"**.
2.  **Organização:** Selecione a organização correta (se aplicável).
3.  **Nome do Projeto:** Defina um nome (ex: `RegiFlex-Cliente-X`).
4.  **Senha do Banco de Dados:** Crie e salve uma **senha forte**. Esta senha será necessária para algumas operações avançadas e para a Supabase CLI.
5.  **Região:** Selecione a região de hospedagem mais próxima do cliente para garantir a menor latência.
6.  Clique em **"Create new project"**.

### 2.2. Clonagem do Repositório do RegiFlex

Abra o terminal e execute os comandos para obter o código-fonte e entrar no diretório do projeto:

```bash
# Clonar o repositório oficial do RegiFlex
git clone https://github.com/artur-source/RegiFlex-teste.git

# Navegar para o diretório do projeto
cd RegiFlex-teste
```

### 2.3. Configuração e Vinculação da Supabase CLI

Esta etapa conecta o código local do RegiFlex ao seu novo projeto remoto no Supabase.

1.  **Login na CLI:**
    ```bash
    supabase login
    ```
    *   Este comando abrirá seu navegador para autenticação. Siga as instruções para autorizar a CLI.

2.  **Obtenção do Project Ref (ID do Projeto):**
    *   No Dashboard do Supabase, vá para **Project Settings** (ícone de engrenagem) -> **General Settings**.
    *   Copie o valor de **"Project Ref"** (é um UUID longo, ex: `abcdefgh-1234-5678-ijkl-mnopqrstuvwx`).

3.  **Vinculação do Projeto:**
    *   Execute o comando de vinculação, substituindo `SEU_PROJECT_REF` pelo ID copiado:
    ```bash
    # Exemplo: supabase link --project-ref abcdefgh-1234-5678-ijkl-mnopqrstuvwx
    supabase link --project-ref SEU_PROJECT_REF
    ```
    *   **Resultado Esperado:** A CLI confirmará a vinculação e criará um arquivo de configuração local.

### 2.4. Aplicação do Schema do Banco de Dados (Migração)

O repositório do RegiFlex contém o schema completo do banco de dados (tabelas, RLS, funções, etc.) em arquivos de migração.

1.  **Aplicação das Migrações ao Projeto Remoto:**
    *   **IMPORTANTE:** Para aplicar as migrações ao seu projeto remoto (o que você criou no Dashboard), você deve usar o flag `--linked`. O comando `supabase migration up` sem este flag tenta se conectar a um banco de dados local, o que pode causar o erro de conexão.

    ```bash
    supabase migration up --linked
    ```
    *   **Verificação Crucial:** Acesse o Dashboard do Supabase, vá para **Database** -> **Tables** e confirme que as tabelas do RegiFlex foram criadas. Verifique também as políticas de **Row Level Security (RLS)** em **Authentication** -> **Policies**.

---

## 3. Configuração do Frontend

O frontend (React.js) precisa ser configurado para se comunicar com o seu novo backend Supabase.

### 3.1. Obtenção das Credenciais do Projeto

Estas credenciais são públicas e necessárias para que o frontend se comunique com o Supabase.

1.  No Dashboard do Supabase, vá para **Project Settings** -> **API**.
2.  **Copie e salve** os seguintes valores:
    *   **URL do Projeto (Project URL)**: O endpoint principal (ex: `https://abcdefgh12345678.supabase.co`).
    *   **Chave Anon Pública (Public Anon Key)**: A chave que o frontend usará para interagir (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`).

### 3.2. Configuração das Variáveis de Ambiente

As credenciais obtidas devem ser configuradas como variáveis de ambiente para o frontend.

1.  Navegue até o diretório do frontend:
    ```bash
    cd frontend
    ```
2.  Crie um arquivo de variáveis de ambiente chamado `.env.production` (ou `.env.local` para testes locais).

    ```bash
    # Criar o arquivo .env.production
    touch .env.production
    ```

3.  Edite o arquivo `.env.production` e insira as credenciais, substituindo os placeholders:

    ```bash
    # Conteúdo de .env.production
    VITE_SUPABASE_URL="[SUA_URL_DO_PROJETO]"
    VITE_SUPABASE_ANON_KEY="[SUA_CHAVE_ANON_PUBLICA]"
    ```

    **Importante:** Se você for usar um serviço de hospedagem como Vercel ou Netlify (Opção Recomendada), você **NÃO** deve incluir este arquivo no Git. Em vez disso, configure estas variáveis **diretamente no painel do serviço de hospedagem** para maior segurança.

---

## 4. Deploy do Frontend

O frontend do RegiFlex é um aplicativo estático e pode ser *deployado* em qualquer serviço de hospedagem estática.

### 4.1. Construção do Projeto (Build)

1.  Certifique-se de estar no diretório `frontend` e instale as dependências:
    ```bash
    npm install
    ```
2.  Construa o projeto para produção:
    ```bash
    npm run build
    ```
    *   **Resultado Esperado:** Este comando criará uma pasta `dist/` dentro do diretório `frontend/` contendo todos os arquivos estáticos otimizados (HTML, CSS, JavaScript).

### 4.2. Hospedagem e Deploy

| Opção | Detalhes da Configuração |
| :--- | :--- |
| **Recomendada (Vercel/Netlify)** | 1. Conecte o repositório Git ao serviço de hospedagem. 2. **Build Command:** `npm run build` (ou `cd frontend && npm install && npm run build`). 3. **Output Directory:** `frontend/dist`. 4. **Variáveis de Ambiente:** Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do serviço de hospedagem. |
| **Manual (Servidor Web)** | Faça o upload de **todo o conteúdo** da pasta `frontend/dist` para o diretório raiz do seu servidor web (ex: `/var/www/html` no Apache/Nginx). |

---

## 5. Pós-Instalação e Configurações Avançadas

### 5.1. Criação do Usuário Administrador (Acesso Inicial)

Como a migração não cria usuários iniciais, o primeiro acesso deve ser para criar o administrador.

1.  Acesse o domínio do seu deploy no navegador.
2.  Use a tela de **Cadastro** ou **Sign Up** para criar a primeira conta de usuário (que será o administrador da clínica).
3.  **Atenção:** Se o sistema exigir confirmação por e-mail, verifique a caixa de entrada do e-mail configurado no Supabase (ou desative a confirmação por e-mail no Dashboard do Supabase em **Authentication** -> **Settings**).

### 5.2. Configuração das Edge Functions (Opcional)

Se o RegiFlex utilizar funcionalidades avançadas como `predict-no-show` ou `provision-new-tenant`, você deve fazer o deploy delas.

1.  Navegue para o diretório raiz do projeto (`cd ..` se estiver em `frontend`).
2.  **Deploy das Funções:**
    ```bash
    supabase functions deploy
    ```
3.  **Variáveis de Ambiente para Funções:** Se as funções exigirem chaves de API de terceiros (ex: OpenAI, Stripe), configure-as no Dashboard do Supabase, em **Edge Functions** -> **Settings** -> **Environment Variables**. Estas são variáveis secretas e não devem ser expostas no frontend.

---

## 6. Perguntas Frequentes (FAQ)

| Pergunta | Resposta Detalhada |
| :--- | :--- |
| **O que é o "Project Ref" do Supabase?** | É o identificador único do seu projeto Supabase, encontrado em **Project Settings** -> **General Settings**. É essencial para o comando `supabase link`. |
| **O que é RLS?** | **Row Level Security** (Segurança em Nível de Linha). É uma funcionalidade do PostgreSQL que garante que cada usuário só possa acessar os dados que lhe pertencem. O schema do RegiFlex já deve ter as políticas de RLS configuradas após a migração. |
| **As chaves de API são seguras?** | A **Chave Anon Pública** (`VITE_SUPABASE_ANON_KEY`) é segura para ser exposta no frontend, pois é protegida pelo RLS. Chaves secretas (como a **Service Role Key**) **NUNCA** devem ser usadas no frontend ou expostas em variáveis de ambiente públicas. |
| **Como faço backup dos dados?** | O Supabase gerencia o backup automático do seu banco de dados. Você pode configurar backups adicionais ou exportações manuais através do Dashboard. |
| **Posso usar credenciais de teste?** | Para usar credenciais de teste (ex: `admin@regiflex.com` / `password`), você precisará inseri-las manualmente na tabela `auth.users` do Supabase ou criar um script de *seed* específico para produção, pois a migração não executa o `seed.sql` automaticamente. |
| **Por que a migração falhou com erro de conexão local?** | O comando `supabase migration up` sem o flag `--linked` tenta se conectar a um banco de dados local (`127.0.0.1`), que não estava ativo. **A solução é usar `supabase migration up --linked`** para aplicar as migrações diretamente ao seu projeto remoto no Supabase. |

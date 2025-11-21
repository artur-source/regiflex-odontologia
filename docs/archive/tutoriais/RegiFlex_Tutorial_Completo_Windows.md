# Tutorial Completo de Instalação do RegiFlex no Windows

**Versão:** 2.0.0  
**Data:** Outubro de 2025  
**Arquitetura:** Supabase + React.js

Este tutorial fornece um guia passo a passo detalhado para configurar e executar o sistema RegiFlex em seu ambiente Windows. Com a nova arquitetura baseada em **Supabase**, a instalação ficou muito mais simples, eliminando a necessidade de Docker e servidores próprios.

---

## 1. O que é o RegiFlex?

O RegiFlex é um sistema completo de gestão para clínicas de psicologia, desenvolvido para simplificar o registro, acompanhamento e análise de informações de pacientes e sessões.

### Funcionalidades Principais

**Gestão de Pacientes:** Cadastro completo de informações demográficas, contato e histórico com interface intuitiva e segura.

**Gestão de Sessões:** Agendamento, registro de sessões e evolução do paciente com controle de status.

**Autenticação e Autorização:** Sistema de login seguro com diferentes perfis de usuário (Admin, Psicólogo, Recepcionista) gerenciado pelo Supabase Auth.

**QR Code:** Geração de QR Codes para acesso rápido a informações de pacientes.

**Backend Gerenciado:** Utiliza Supabase para banco de dados, autenticação e APIs, garantindo escalabilidade e segurança.

### Tecnologias Principais

**Backend:** Supabase (PostgreSQL gerenciado, Supabase Auth, API RESTful automática)

**Frontend:** React.js, Vite, Tailwind CSS, Shadcn/ui

**Infraestrutura:** Supabase Cloud (sem necessidade de servidores próprios)

---

## 2. Pré-requisitos Essenciais

Para executar o RegiFlex, você precisará instalar os seguintes softwares em seu sistema Windows e criar uma conta no Supabase.

### 2.1. Node.js e npm

O Node.js é necessário para executar o frontend React.js, e o npm (Node Package Manager) é usado para gerenciar as dependências do projeto.

**Download:** Baixe o instalador LTS (Long Term Support) mais recente em [nodejs.org](https://nodejs.org/)

**Instalação:** Execute o instalador e siga as instruções padrão. Certifique-se de marcar a opção para adicionar o Node.js ao PATH do sistema.

**Verificação:** Após a instalação, abra o **Prompt de Comando** (cmd) ou **PowerShell** e execute:
```bash
node --version
npm --version
```

Você deve ver as versões instaladas do Node.js e npm.

### 2.2. Git for Windows

O Git for Windows é necessário para clonar o repositório do projeto.

**Download:** Baixe o instalador em [git-scm.com/download/win](https://git-scm.com/download/win)

**Instalação:** Siga as instruções padrão do instalador. As opções padrão geralmente são suficientes.

**Verificação:** Abra o **Git Bash** ou **Prompt de Comando** e execute:
```bash
git --version
```

### 2.3. Conta no Supabase

O Supabase é a plataforma de backend que o RegiFlex utiliza. Você precisará criar uma conta gratuita.

**Acesse:** [supabase.com](https://supabase.com)

**Cadastro:** Clique em "Start your project" e crie uma conta usando GitHub, Google ou email.

**Criação do Projeto:** Após fazer login, clique em "New Project" e preencha:
- **Nome do Projeto:** RegiFlex (ou o nome que preferir)
- **Database Password:** Escolha uma senha forte e anote-a
- **Região:** Escolha a região mais próxima de você

Aguarde alguns minutos enquanto o Supabase cria seu projeto.

---

## 3. Obtendo o Código do RegiFlex

### 3.1. Clone o Repositório

Abra o **Git Bash** ou **Prompt de Comando** e navegue até o diretório onde deseja armazenar o projeto:

```bash
cd C:\Projetos
```

Clone o repositório do GitHub:

```bash
git clone https://github.com/artur-source/RegiFlex-teste.git
```

Entre no diretório do projeto:

```bash
cd RegiFlex-teste
```

---

## 4. Configuração do Supabase

### 4.1. Obtenha as Credenciais do Supabase

No painel do Supabase, acesse seu projeto e clique em **Settings** (ícone de engrenagem) no menu lateral.

Clique em **API** e copie as seguintes informações:

- **Project URL:** `https://seu-projeto-id.supabase.co`
- **anon public key:** Uma chave longa começando com `eyJ...`

### 4.2. Configure o Banco de Dados

No painel do Supabase, clique em **SQL Editor** no menu lateral.

Abra o arquivo `database/schema.sql` do projeto no seu editor de texto favorito (Notepad++, VS Code, etc.) e copie todo o conteúdo.

Cole o conteúdo no SQL Editor do Supabase e clique em **Run** para criar as tabelas.

Você verá uma mensagem de sucesso confirmando que as tabelas foram criadas:
- usuarios
- pacientes
- sessoes
- evolucao
- logs

---

## 5. Configuração do Frontend

### 5.1. Instale as Dependências

Navegue até a pasta do frontend:

```bash
cd frontend
```

Instale as dependências do projeto:

```bash
npm install
```

Este processo pode levar alguns minutos, pois o npm irá baixar todas as bibliotecas necessárias.

### 5.2. Configure as Variáveis de Ambiente

Na pasta `frontend`, crie um arquivo chamado `.env` (note o ponto no início do nome).

**No Windows Explorer:** Para criar um arquivo que começa com ponto, você pode usar o Notepad++, VS Code ou criar via linha de comando.

**Via Prompt de Comando:**
```bash
echo. > .env
```

Abra o arquivo `.env` em um editor de texto e adicione o seguinte conteúdo, substituindo pelos valores que você copiou do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
```

**Importante:** Substitua `seu-projeto-id` e `sua-chave-anon-publica-aqui` pelos valores reais do seu projeto Supabase.

Salve o arquivo com codificação **UTF-8**.

---

## 6. Executando o RegiFlex

### 6.1. Inicie o Servidor de Desenvolvimento

Ainda na pasta `frontend`, execute:

```bash
npm run dev
```

Você verá uma mensagem similar a:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6.2. Acesse a Aplicação

Abra seu navegador (Chrome, Firefox, Edge) e acesse:

```
http://localhost:5173
```

Você verá a tela de login do RegiFlex!

---

## 7. Primeiro Acesso

### 7.1. Criar Usuário Administrador

Como esta é a primeira vez que você está acessando o sistema, você precisará criar um usuário administrador.

**Opção 1: Via SQL Editor do Supabase**

No SQL Editor do Supabase, execute:

```sql
INSERT INTO usuarios (username, email, senha_hash, nome_completo, perfil, ativo)
VALUES (
  'admin',
  'admin@regiflex.com',
  'admin123',
  'Administrador',
  'admin',
  true
);
```

**Opção 2: Via Interface (se implementado o cadastro)**

Se a interface de cadastro estiver disponível, você pode criar um usuário diretamente pela aplicação.

### 7.2. Faça Login

Na tela de login, use as credenciais:

- **Usuário:** admin
- **Senha:** admin123 (ou a senha que você definiu)

Após o login bem-sucedido, você será redirecionado para o Dashboard do RegiFlex!

---

## 8. Testando as Funcionalidades

### 8.1. Cadastrar um Paciente

No menu lateral, clique em **Pacientes** e depois em **Novo Paciente**.

Preencha o formulário com os dados do paciente:
- Nome completo
- Data de nascimento
- CPF
- Telefone
- Email
- Endereço

Clique em **Cadastrar** e verifique se o paciente aparece na lista.

### 8.2. Agendar uma Sessão

No menu lateral, clique em **Sessões** e depois em **Nova Sessão**.

Selecione o paciente, data, horário e outras informações relevantes.

Clique em **Agendar** para salvar a sessão.

### 8.3. Visualizar Dashboard

No menu lateral, clique em **Dashboard** para ver estatísticas e gráficos sobre:
- Total de pacientes
- Sessões do dia
- Sessões da semana
- Sessões do mês

---

## 9. Solução de Problemas Comuns

### Erro: "Failed to fetch" ou "Network Error"

**Causa:** As variáveis de ambiente não foram configuradas corretamente.

**Solução:** Verifique se o arquivo `.env` existe na pasta `frontend` e se contém as credenciais corretas do Supabase.

### Erro: "relation does not exist"

**Causa:** As tabelas não foram criadas no Supabase.

**Solução:** Execute o script `database/schema.sql` no SQL Editor do Supabase.

### Porta 5173 já está em uso

**Causa:** Outro processo está usando a porta 5173.

**Solução:** Pare o outro processo ou altere a porta no arquivo `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3000 // ou outra porta disponível
  }
})
```

### Página em branco após login

**Causa:** Erro de JavaScript no frontend.

**Solução:** Abra o Console do navegador (F12) e verifique se há erros. Certifique-se de que todas as dependências foram instaladas corretamente com `npm install`.

---

## 10. Parando a Aplicação

Para parar o servidor de desenvolvimento, volte ao terminal onde executou `npm run dev` e pressione:

```
Ctrl + C
```

Confirme quando solicitado.

---

## 11. Próximos Passos

Após a instalação bem-sucedida, você pode:

**Explorar as Funcionalidades:** Teste todas as funcionalidades do sistema, como cadastro de pacientes, agendamento de sessões, geração de relatórios, etc.

**Personalizar o Sistema:** Modifique cores, logos e textos para adequar o sistema à identidade visual da sua clínica.

**Configurar Autenticação Completa:** Implemente o fluxo completo de autenticação do Supabase Auth para maior segurança.

**Deploy em Produção:** Quando estiver pronto, faça o deploy do frontend em plataformas como Vercel, Netlify ou GitHub Pages.

**Ler a Documentação:** Acesse a documentação completa no Notion: https://www.notion.so/286550a8829e81d689e8f173302aeafb

---

## 12. Recursos Adicionais

### Links Úteis

- **Repositório do Projeto:** https://github.com/artur-source/RegiFlex-teste
- **Página de Marketing:** https://artur-source.github.io/RegiFlex/
- **Documentação Notion:** https://www.notion.so/286550a8829e81d689e8f173302aeafb
- **Documentação Supabase:** https://supabase.com/docs

### Suporte

Se você encontrar problemas durante a instalação ou uso do RegiFlex, você pode:

- Abrir uma **Issue** no GitHub: https://github.com/artur-source/RegiFlex-teste/issues
- Consultar a documentação no Notion
- Entrar em contato com a equipe de desenvolvimento

---

## 13. Conclusão

Parabéns! Você instalou e configurou o RegiFlex com sucesso. A nova arquitetura baseada em Supabase torna o sistema mais simples de instalar, mais seguro e mais escalável.

Aproveite o sistema e boa gestão da sua clínica de psicologia!

---

**Tutorial elaborado por:** Equipe RegiFlex  
**Versão:** 2.0.0  
**Data:** Outubro de 2025

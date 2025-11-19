# Guia de Configuração do Stripe para o Módulo Odontologia

## 1. Criação de Produtos e Preços

Os seguintes produtos e preços devem ser criados no Dashboard do Stripe ou via API, conforme a Seção 4.1 do Prompt Mestre.

### 1.1. Produtos de Procedimentos (One-Time Payments)

| Produto | Preço (R$) | Tipo |
| :--- | :--- | :--- |
| Limpeza Profissional | 150,00 | Procedimento |
| Restauração Simples | 250,00 | Procedimento |
| Restauração Composta | 400,00 | Procedimento |
| Extração Dentária | 300,00 | Procedimento |
| Implante Dentário | 2.500,00 | Procedimento |
| Tratamento de Canal | 600,00 | Procedimento |
| Ortodontia (Mês) | 500,00 | Assinatura |

### 1.2. Planos de Assinatura (Recorrentes)

| Plano | Preço Mensal (R$) | Funcionalidades |
| :--- | :--- | :--- |
| Starter | 49,90 | Gestão de pacientes, agendamento, relatórios básicos. |
| Professional | 99,90 | Tudo do Starter + Odontograma interativo, análise de imagens, faturamento. |
| Enterprise | 199,90 | Tudo do Professional + Múltiplos profissionais, API customizada, suporte prioritário. |

## 2. Configuração do Webhook

1.  **Criar Endpoint:** No Dashboard do Stripe, crie um novo endpoint de Webhook que aponte para o endereço da sua API (ex: `https://your-vercel-app.vercel.app/api/webhooks/stripe`).
2.  **Eventos:** Configure o endpoint para escutar os seguintes eventos:
    - `payment_intent.succeeded`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
3.  **Chave Secreta:** Copie a chave secreta do Webhook e configure-a como variável de ambiente no seu projeto Vercel/hospedagem: `STRIPE_WEBHOOK_SECRET_ODONTOLOGIA`.
4.  **Validação:** O arquivo `api/webhooks/stripe.js` utilizará esta chave para validar a origem do evento e processar a atualização na tabela `odontologia_faturamento`.

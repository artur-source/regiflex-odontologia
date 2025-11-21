# Guia Completo: Configuração do Stripe Dashboard para RegiFlex

**Data:** 2025-10-09  
**Versão:** 2.1.2  
**Classificação:** 📋 IMPLEMENTAÇÃO

---

## 🎯 Visão Geral

Este guia detalha como configurar completamente o Stripe Dashboard para o RegiFlex, incluindo produtos, preços, métodos de pagamento, webhooks e todas as configurações necessárias para operação comercial.

## 🔧 Configuração Inicial do Stripe

### 1. Criar Conta Stripe

1. **Acessar:** https://dashboard.stripe.com/register
2. **Criar conta** com email comercial (regiflex.contato@gmail.com)
3. **Verificar email** e completar onboarding
4. **Ativar conta** fornecendo dados da empresa

### 2. Configurar Informações da Empresa

```
Dashboard → Settings → Account details

Informações da Empresa:
- Nome: RegiFlex Sistemas Ltda
- Email: regiflex.contato@gmail.com
- Telefone: +55 11 99999-9999
- Website: https://artur-source.github.io/RegiFlex/
- Descrição: Sistema de gestão para clínicas de psicologia
- Categoria: Software/SaaS
- País: Brasil
- Moeda principal: BRL (Real Brasileiro)
```

## 💳 Configuração de Produtos e Preços

### 1. Criar Produtos

**Navegar para:** `Dashboard → Products → Add product`

#### Produto 1: RegiFlex Individual

```json
{
  "name": "RegiFlex Individual",
  "description": "Plano Individual do RegiFlex - Sistema de gestão para psicólogos autônomos",
  "images": ["https://artur-source.github.io/RegiFlex/assets/logo.png"],
  "metadata": {
    "plan_type": "individual",
    "max_patients": "50",
    "max_users": "1",
    "features": "basic_reports,email_support,appointment_scheduling"
  },
  "statement_descriptor": "REGIFLEX IND",
  "unit_label": "licença"
}
```

**Preço Recorrente:**
```json
{
  "unit_amount": 3490,
  "currency": "brl",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "nickname": "Individual Mensal",
  "metadata": {
    "plan_type": "individual",
    "billing_cycle": "monthly"
  }
}
```

#### Produto 2: RegiFlex Clínica

```json
{
  "name": "RegiFlex Clínica",
  "description": "Plano Clínica do RegiFlex - Sistema de gestão para clínicas com múltiplos profissionais",
  "images": ["https://artur-source.github.io/RegiFlex/assets/logo.png"],
  "metadata": {
    "plan_type": "clinica",
    "max_patients": "unlimited",
    "max_users": "unlimited",
    "features": "advanced_reports,priority_support,appointment_scheduling,integrations"
  },
  "statement_descriptor": "REGIFLEX CLI",
  "unit_label": "licença"
}
```

**Preço Recorrente:**
```json
{
  "unit_amount": 9990,
  "currency": "brl",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "nickname": "Clínica Mensal",
  "metadata": {
    "plan_type": "clinica",
    "billing_cycle": "monthly"
  }
}
```

### 2. Configurar Preços Anuais (Desconto)

#### Individual Anual (15% desconto)

```json
{
  "unit_amount": 35694, // R$ 356,94 (equivale a R$ 29,74/mês)
  "currency": "brl",
  "recurring": {
    "interval": "year",
    "interval_count": 1
  },
  "nickname": "Individual Anual",
  "metadata": {
    "plan_type": "individual",
    "billing_cycle": "yearly",
    "discount_percent": "15"
  }
}
```

#### Clínica Anual (15% desconto)

```json
{
  "unit_amount": 101898, // R$ 1.018,98 (equivale a R$ 84,92/mês)
  "currency": "brl",
  "recurring": {
    "interval": "year",
    "interval_count": 1
  },
  "nickname": "Clínica Anual",
  "metadata": {
    "plan_type": "clinica",
    "billing_cycle": "yearly",
    "discount_percent": "15"
  }
}
```

## 🔗 Configuração de Payment Links

### 1. Criar Payment Links

**Navegar para:** `Dashboard → Payment links → Create payment link`

#### Link Individual Mensal

```json
{
  "line_items": [{
    "price": "price_individual_monthly",
    "quantity": 1
  }],
  "payment_method_types": ["card", "pix"],
  "billing_address_collection": "required",
  "tax_id_collection": {
    "enabled": true
  },
  "allow_promotion_codes": true,
  "after_completion": {
    "type": "redirect",
    "redirect": {
      "url": "https://regiflex.app/welcome?plan=individual"
    }
  },
  "metadata": {
    "plan_type": "individual",
    "source": "payment_link"
  }
}
```

#### Link Clínica Mensal

```json
{
  "line_items": [{
    "price": "price_clinica_monthly",
    "quantity": 1
  }],
  "payment_method_types": ["card", "pix"],
  "billing_address_collection": "required",
  "tax_id_collection": {
    "enabled": true
  },
  "allow_promotion_codes": true,
  "after_completion": {
    "type": "redirect",
    "redirect": {
      "url": "https://regiflex.app/welcome?plan=clinica"
    }
  },
  "metadata": {
    "plan_type": "clinica",
    "source": "payment_link"
  }
}
```

## 🎫 Configuração de Cupons de Desconto

### 1. Cupons de Lançamento

**Navegar para:** `Dashboard → Coupons → Create coupon`

#### Cupom LANCAMENTO30

```json
{
  "id": "LANCAMENTO30",
  "percent_off": 30,
  "duration": "repeating",
  "duration_in_months": 3,
  "max_redemptions": 100,
  "redeem_by": "2025-12-31T23:59:59Z",
  "metadata": {
    "campaign": "launch",
    "description": "30% de desconto por 3 meses - Lançamento"
  }
}
```

#### Cupom PRIMEIROANO

```json
{
  "id": "PRIMEIROANO",
  "percent_off": 50,
  "duration": "once",
  "max_redemptions": 50,
  "redeem_by": "2025-11-30T23:59:59Z",
  "metadata": {
    "campaign": "first_year",
    "description": "50% de desconto no primeiro pagamento"
  }
}
```

#### Cupom ESTUDANTE

```json
{
  "id": "ESTUDANTE",
  "percent_off": 40,
  "duration": "forever",
  "max_redemptions": 200,
  "metadata": {
    "campaign": "student",
    "description": "40% de desconto permanente para estudantes"
  }
}
```

## 🔔 Configuração de Webhooks

### 1. Criar Webhook Endpoint

**Navegar para:** `Dashboard → Developers → Webhooks → Add endpoint`

```json
{
  "url": "https://regiflex-api.vercel.app/api/stripe/webhook",
  "events": [
    "customer.created",
    "customer.updated",
    "customer.deleted",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.created",
    "invoice.updated",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "invoice.payment_action_required",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_method.attached",
    "payment_method.detached",
    "checkout.session.completed",
    "checkout.session.expired"
  ],
  "description": "RegiFlex Production Webhook",
  "metadata": {
    "environment": "production",
    "version": "v1"
  }
}
```

### 2. Configurar Webhook de Teste

```json
{
  "url": "https://regiflex-test.vercel.app/api/stripe/webhook",
  "events": ["*"],
  "description": "RegiFlex Test Webhook",
  "metadata": {
    "environment": "test",
    "version": "v1"
  }
}
```

## 💰 Configuração de Métodos de Pagamento

### 1. Ativar Métodos de Pagamento

**Navegar para:** `Dashboard → Settings → Payment methods`

#### Métodos Habilitados:

```json
{
  "card": {
    "enabled": true,
    "brands": ["visa", "mastercard", "amex", "elo", "hipercard"],
    "capture_method": "automatic",
    "setup_future_usage": "on_session"
  },
  "pix": {
    "enabled": true,
    "display_preference": {
      "preference": "none"
    }
  },
  "boleto": {
    "enabled": true,
    "expires_after_days": 3
  },
  "sepa_debit": {
    "enabled": false
  },
  "link": {
    "enabled": true
  }
}
```

### 2. Configurar Checkout

```json
{
  "payment_method_types": ["card", "pix", "boleto"],
  "billing_address_collection": "required",
  "shipping_address_collection": {
    "allowed_countries": ["BR"]
  },
  "tax_id_collection": {
    "enabled": true
  },
  "allow_promotion_codes": true,
  "automatic_tax": {
    "enabled": false
  }
}
```

## 📊 Configuração de Relatórios e Analytics

### 1. Configurar Relatórios Automáticos

**Navegar para:** `Dashboard → Reporting → Scheduled reports`

#### Relatório Mensal de Receita

```json
{
  "report_type": "balance.summary.1",
  "interval": "monthly",
  "start_date": "2025-01-01",
  "columns": [
    "created",
    "available_on",
    "currency",
    "gross",
    "fee",
    "net",
    "reporting_category"
  ],
  "recipients": ["regiflex.contato@gmail.com"]
}
```

#### Relatório de Assinaturas

```json
{
  "report_type": "subscriptions.summary.1",
  "interval": "weekly",
  "start_date": "2025-01-01",
  "columns": [
    "id",
    "customer_id",
    "customer_email",
    "status",
    "created",
    "current_period_start",
    "current_period_end",
    "plan_id",
    "plan_amount"
  ],
  "recipients": ["regiflex.contato@gmail.com"]
}
```

### 2. Configurar Alertas

#### Alerta de Pagamento Falhado

```json
{
  "type": "payment_failed",
  "threshold": 1,
  "period": "daily",
  "recipients": ["regiflex.contato@gmail.com"],
  "webhook_url": "https://regiflex-api.vercel.app/api/alerts/payment-failed"
}
```

#### Alerta de Chargeback

```json
{
  "type": "chargeback_created",
  "threshold": 1,
  "period": "immediate",
  "recipients": ["regiflex.contato@gmail.com"],
  "webhook_url": "https://regiflex-api.vercel.app/api/alerts/chargeback"
}
```

## 🔒 Configuração de Segurança

### 1. Configurar Radar (Prevenção de Fraude)

**Navegar para:** `Dashboard → Radar → Rules`

#### Regras de Radar

```javascript
// Bloquear cartões de países de alto risco
if (card_country != 'BR') {
  block();
}

// Bloquear tentativas com CVC inválido
if (cvc_check == 'fail') {
  block();
}

// Revisar pagamentos acima de R$ 500
if (amount > 50000) { // 50000 centavos = R$ 500
  review();
}

// Bloquear múltiplas tentativas do mesmo IP
if (ip_address_risk_level == 'highest') {
  block();
}

// Revisar emails descartáveis
if (email_risk_level == 'highest') {
  review();
}
```

### 2. Configurar 3D Secure

```json
{
  "3d_secure": {
    "enabled": true,
    "request_three_d_secure": "automatic"
  },
  "radar": {
    "session": "enabled"
  }
}
```

## 📧 Configuração de Emails

### 1. Personalizar Templates de Email

**Navegar para:** `Dashboard → Settings → Emails`

#### Email de Recibo

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Recibo de Pagamento - RegiFlex</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #4F46E5; color: white; padding: 20px; text-align: center;">
            <h1>RegiFlex</h1>
            <p>Sistema de Gestão para Psicólogos</p>
        </div>
        
        <div style="padding: 20px;">
            <h2>Pagamento Confirmado! ✅</h2>
            
            <p>Olá {{customer_name}},</p>
            
            <p>Seu pagamento foi processado com sucesso:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Plano:</strong> {{product_name}}</p>
                <p><strong>Valor:</strong> R$ {{amount_formatted}}</p>
                <p><strong>Data:</strong> {{charge_date}}</p>
                <p><strong>Método:</strong> {{payment_method}}</p>
            </div>
            
            <p>Sua conta está ativa e você já pode acessar o sistema:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://regiflex.app/login" 
                   style="background: #4F46E5; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Acessar RegiFlex
                </a>
            </div>
            
            <p>Em caso de dúvidas, entre em contato:</p>
            <p>📧 regiflex.contato@gmail.com</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 12px;">
                Este é um email automático. Para suporte, responda este email ou 
                acesse nossa central de ajuda.
            </p>
        </div>
    </div>
</body>
</html>
```

#### Email de Falha no Pagamento

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Problema no Pagamento - RegiFlex</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #DC2626; color: white; padding: 20px; text-align: center;">
            <h1>RegiFlex</h1>
            <p>Ação Necessária</p>
        </div>
        
        <div style="padding: 20px;">
            <h2>Problema no Pagamento ⚠️</h2>
            
            <p>Olá {{customer_name}},</p>
            
            <p>Não conseguimos processar seu pagamento:</p>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; 
                        border-left: 4px solid #DC2626; margin: 20px 0;">
                <p><strong>Plano:</strong> {{product_name}}</p>
                <p><strong>Valor:</strong> R$ {{amount_formatted}}</p>
                <p><strong>Tentativa:</strong> {{attempt_date}}</p>
                <p><strong>Motivo:</strong> {{failure_reason}}</p>
            </div>
            
            <p>Para manter sua conta ativa, atualize seu método de pagamento:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{update_payment_url}}" 
                   style="background: #DC2626; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Atualizar Pagamento
                </a>
            </div>
            
            <p><strong>Importante:</strong> Sua conta será suspensa em 7 dias se o pagamento não for atualizado.</p>
            
            <p>Precisa de ajuda? Entre em contato:</p>
            <p>📧 regiflex.contato@gmail.com</p>
        </div>
    </div>
</body>
</html>
```

## 🌐 Configuração de Domínio Personalizado

### 1. Configurar Domínio para Checkout

**Navegar para:** `Dashboard → Settings → Branding`

```json
{
  "custom_domain": "checkout.regiflex.app",
  "logo": "https://artur-source.github.io/RegiFlex/assets/logo.png",
  "primary_color": "#4F46E5",
  "secondary_color": "#F8FAFC"
}
```

### 2. Configurar DNS

```dns
CNAME checkout.regiflex.app -> checkout.stripe.com
```

## 📱 Configuração Mobile

### 1. Configurar Apple Pay

```json
{
  "apple_pay": {
    "enabled": true,
    "domains": [
      "regiflex.app",
      "checkout.regiflex.app",
      "artur-source.github.io"
    ]
  }
}
```

### 2. Configurar Google Pay

```json
{
  "google_pay": {
    "enabled": true,
    "merchant_id": "regiflex_merchant_id"
  }
}
```

## 🔧 Configuração de API Keys

### 1. Chaves de Produção

```bash
# Variáveis de ambiente para produção
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Chaves de Teste

```bash
# Variáveis de ambiente para desenvolvimento
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📋 Checklist de Configuração

### ✅ Configuração Básica
- [ ] Conta Stripe criada e verificada
- [ ] Informações da empresa preenchidas
- [ ] Produtos Individual e Clínica criados
- [ ] Preços mensais e anuais configurados
- [ ] Payment Links criados

### ✅ Métodos de Pagamento
- [ ] Cartão de crédito habilitado
- [ ] PIX habilitado
- [ ] Boleto habilitado (opcional)
- [ ] Apple Pay configurado
- [ ] Google Pay configurado

### ✅ Webhooks e Integração
- [ ] Webhook endpoint configurado
- [ ] Eventos necessários selecionados
- [ ] Webhook secret salvo nas variáveis de ambiente
- [ ] Teste de webhook realizado

### ✅ Segurança e Fraude
- [ ] Radar configurado
- [ ] Regras de prevenção criadas
- [ ] 3D Secure habilitado
- [ ] Alertas configurados

### ✅ Comunicação
- [ ] Templates de email personalizados
- [ ] Relatórios automáticos configurados
- [ ] Domínio personalizado configurado
- [ ] Branding aplicado

### ✅ Cupons e Promoções
- [ ] Cupons de lançamento criados
- [ ] Cupom estudante configurado
- [ ] Promoções sazonais planejadas

## 🚀 Próximos Passos

1. **Testar Fluxo Completo**: Fazer uma compra teste de cada plano
2. **Validar Webhooks**: Verificar se eventos estão sendo processados
3. **Monitorar Métricas**: Acompanhar conversão e churn
4. **Otimizar Checkout**: A/B test diferentes layouts
5. **Implementar Upsells**: Oferecer upgrades de plano
6. **Configurar Dunning**: Recuperação de pagamentos falhados

## 📞 Suporte Stripe

- **Documentação**: https://stripe.com/docs
- **Suporte**: https://support.stripe.com
- **Status**: https://status.stripe.com
- **Comunidade**: https://github.com/stripe

---

**Configuração completa do Stripe Dashboard para operação comercial do RegiFlex! 🎉**

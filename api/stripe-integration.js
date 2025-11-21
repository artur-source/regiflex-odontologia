
import express from 'express';
import stripeClient from './stripe-client.js';
// Julião: Revisar a idempotência dessa chamada ao Stripe. O erro 409 (Conflict) está sendo tratado corretamente em caso de retentativa? (Segurança/Robustez)
// Julião: Revisar a idempotência dessa chamada ao Stripe. O erro 409 (Conflict) está sendo tratado corretamente em caso de retentativa? (Segurança/Robustez)
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * API Completa de Integração Stripe para RegiFlex
 * 
 * Endpoints:
 * - POST /api/stripe/create-customer - Criar cliente
 * - POST /api/stripe/create-subscription - Criar assinatura
 * - POST /api/stripe/create-checkout - Criar sessão de checkout
 * - POST /api/stripe/webhook - Webhook do Stripe
 * - GET /api/stripe/customer/:id - Dados do cliente
 * - GET /api/stripe/subscription/:id - Dados da assinatura
 * - POST /api/stripe/cancel-subscription - Cancelar assinatura
 * - POST /api/stripe/update-payment-method - Atualizar método de pagamento
 * - GET /api/stripe/invoices/:customerId - Listar faturas
 * - POST /api/stripe/retry-payment - Retry de pagamento
 * - GET /api/stripe/reports/revenue - Relatório de receita
 */

// ==================== MIDDLEWARE ====================

// Middleware para verificar autenticação
async function authenticateUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro na autenticação' });
  }
}

// Middleware para logs
function logStripeAction(action) {
  return (req, res, next) => {
    console.log(`[Stripe API] ${action}:`, {
      timestamp: new Date().toISOString(),
      user_id: req.user?.id,
      ip: req.ip,
      body: req.body
    });
    next();
  };
}

// ==================== CUSTOMERS ====================

/**
 * POST /api/stripe/create-customer
 * Criar novo cliente no Stripe
 */
router.post('/create-customer', 
  authenticateUser,
  logStripeAction('create-customer'),
  async (req, res) => {
    try {
      const { name, email, phone, address, cnpj, clinic_id, plan_type } = req.body;

      // Validar dados obrigatórios
      if (!name || !email) {
        return res.status(400).json({
          error: 'Nome e email são obrigatórios'
        });
      }

      // Verificar se cliente já existe
      const existingCustomer = await stripeClient.findCustomerByEmail(email);
      
      if (existingCustomer.success && existingCustomer.found) {
        return res.json({
          success: true,
          customer: existingCustomer.customer,
          already_exists: true
        });
      }

      // Criar novo cliente
      const result = await stripeClient.createCustomer({
        name,
        email,
        phone,
        address,
        cnpj,
        clinic_id,
        plan_type
      });

      if (result.success) {
        // Salvar referência no Supabase
        await supabase
          .from('clinicas')
          .update({ 
            stripe_customer_id: result.customer_id,
            billing_email: email
          })
          .eq('id', clinic_id);

        res.json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/stripe/customer/:id
 * Buscar dados do cliente
 */
router.get('/customer/:id',
  authenticateUser,
  logStripeAction('get-customer'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await stripeClient.stripe.customers.retrieve(id, {
        expand: ['subscriptions', 'default_source']
      });

      res.json({
        success: true,
        customer: customer
      });

    } catch (error) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        details: error.message
      });
    }
  }
);

// ==================== SUBSCRIPTIONS ====================

/**
 * POST /api/stripe/create-subscription
 * Criar nova assinatura
 */
router.post('/create-subscription',
  authenticateUser,
  logStripeAction('create-subscription'),
  async (req, res) => {
    try {
      const { 
        customer_id, 
        price_id, 
        clinic_id, 
        plan_type, 
        trial_days,
        quantity = 1 
      } = req.body;

      if (!customer_id || !price_id) {
        return res.status(400).json({
          error: 'customer_id e price_id são obrigatórios'
        });
      }

      const result = await stripeClient.createSubscription({
        customer_id,
        price_id,
        clinic_id,
        plan_type,
        trial_days,
        quantity
      });

      if (result.success) {
        // Atualizar status da clínica no Supabase
        await supabase
          .from('clinicas')
          .update({
            stripe_subscription_id: result.subscription_id,
            subscription_status: result.status,
            plan_type: plan_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', clinic_id);

        res.json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao criar assinatura',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/stripe/subscription/:id
 * Buscar dados da assinatura
 */
router.get('/subscription/:id',
  authenticateUser,
  logStripeAction('get-subscription'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const subscription = await stripeClient.stripe.subscriptions.retrieve(id, {
        expand: ['latest_invoice', 'customer', 'items.data.price']
      });

      res.json({
        success: true,
        subscription: subscription
      });

    } catch (error) {
      res.status(404).json({
        error: 'Assinatura não encontrada',
        details: error.message
      });
    }
  }
);

/**
 * POST /api/stripe/cancel-subscription
 * Cancelar assinatura
 */
router.post('/cancel-subscription',
  authenticateUser,
  logStripeAction('cancel-subscription'),
  async (req, res) => {
    try {
      const { subscription_id, reason, at_period_end = true } = req.body;

      if (!subscription_id) {
        return res.status(400).json({
          error: 'subscription_id é obrigatório'
        });
      }

      const result = await stripeClient.cancelSubscription(subscription_id, {
        reason,
        at_period_end,
        cancelled_by: req.user.id
      });

      if (result.success) {
        // Atualizar status no Supabase
        await supabase
          .from('clinicas')
          .update({
            subscription_status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason
          })
          .eq('stripe_subscription_id', subscription_id);

        res.json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao cancelar assinatura',
        details: error.message
      });
    }
  }
);

/**
 * POST /api/stripe/reactivate-subscription
 * Reativar assinatura cancelada
 */
router.post('/reactivate-subscription',
  authenticateUser,
  logStripeAction('reactivate-subscription'),
  async (req, res) => {
    try {
      const { subscription_id } = req.body;

      const result = await stripeClient.reactivateSubscription(subscription_id);

      if (result.success) {
        // Atualizar status no Supabase
        await supabase
          .from('clinicas')
          .update({
            subscription_status: 'active',
            reactivated_at: new Date().toISOString(),
            cancellation_reason: null
          })
          .eq('stripe_subscription_id', subscription_id);

        res.json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao reativar assinatura',
        details: error.message
      });
    }
  }
);

// ==================== CHECKOUT ====================

/**
 * POST /api/stripe/create-checkout
 * Criar sessão de checkout
 */
router.post('/create-checkout',
  authenticateUser,
  logStripeAction('create-checkout'),
  async (req, res) => {
    try {
      const {
        customer_id,
        price_id,
        clinic_id,
        plan_type,
        success_url,
        cancel_url,
        trial_days,
        payment_methods = ['card', 'pix']
      } = req.body;

      if (!price_id || !success_url || !cancel_url) {
        return res.status(400).json({
          error: 'price_id, success_url e cancel_url são obrigatórios'
        });
      }

      const result = await stripeClient.createCheckoutSession({
        customer_id,
        price_id,
        clinic_id,
        plan_type,
        success_url,
        cancel_url,
        trial_days,
        payment_methods
      });

      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao criar checkout',
        details: error.message
      });
    }
  }
);

// ==================== PAYMENT METHODS ====================

/**
 * GET /api/stripe/payment-methods/:customerId
 * Listar métodos de pagamento
 */
router.get('/payment-methods/:customerId',
  authenticateUser,
  logStripeAction('list-payment-methods'),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const { type = 'card' } = req.query;

      const result = await stripeClient.listPaymentMethods(customerId, type);
      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao listar métodos de pagamento',
        details: error.message
      });
    }
  }
);

/**
 * POST /api/stripe/set-default-payment-method
 * Definir método de pagamento padrão
 */
router.post('/set-default-payment-method',
  authenticateUser,
  logStripeAction('set-default-payment-method'),
  async (req, res) => {
    try {
      const { customer_id, payment_method_id } = req.body;

      const result = await stripeClient.setDefaultPaymentMethod(
        customer_id, 
        payment_method_id
      );

      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao definir método padrão',
        details: error.message
      });
    }
  }
);

// ==================== INVOICES ====================

/**
 * GET /api/stripe/invoices/:customerId
 * Listar faturas do cliente
 */
router.get('/invoices/:customerId',
  authenticateUser,
  logStripeAction('list-invoices'),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const { limit = 10 } = req.query;

      const result = await stripeClient.listInvoices(customerId, parseInt(limit));
      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao listar faturas',
        details: error.message
      });
    }
  }
);

/**
 * POST /api/stripe/retry-payment
 * Retry de pagamento de fatura
 */
router.post('/retry-payment',
  authenticateUser,
  logStripeAction('retry-payment'),
  async (req, res) => {
    try {
      const { invoice_id } = req.body;

      if (!invoice_id) {
        return res.status(400).json({
          error: 'invoice_id é obrigatório'
        });
      }

      const result = await stripeClient.retryInvoicePayment(invoice_id);
      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: 'Erro ao tentar pagamento novamente',
        details: error.message
      });
    }
  }
);

// ==================== COUPONS ====================

/**
 * POST /api/stripe/create-coupon
 * Criar cupom de desconto
 */
router.post('/create-coupon',
  authenticateUser,
  logStripeAction('create-coupon'),
  async (req, res) => {
    try {
      const { couponData } = req.body;
      const result = await stripeClient.createCoupon(couponData);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao criar cupom',
        details: error.message
      });
    }
  }
);

/**
 * POST /api/stripe/apply-coupon
 * Aplicar cupom à assinatura
 */
router.post('/apply-coupon',
  authenticateUser,
  logStripeAction('apply-coupon'),
  async (req, res) => {
    try {
      const { subscription_id, coupon_id } = req.body;
      const result = await stripeClient.applyCouponToSubscription(
        subscription_id, 
        coupon_id
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao aplicar cupom',
        details: error.message
      });
    }
  }
);

// ==================== REPORTS ====================

/**
 * GET /api/stripe/reports/revenue
 * Relatório de receita
 */
router.get('/reports/revenue',
  authenticateUser,
  logStripeAction('revenue-report'),
  async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      if (!start_date || !end_date) {
        return res.status(400).json({
          error: 'start_date e end_date são obrigatórios'
        });
      }
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const result = await stripeClient.getRevenueReport(startDate, endDate);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao gerar relatório',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/stripe/reports/subscriptions
 * Estatísticas de assinaturas
 */
router.get('/reports/subscriptions',
  authenticateUser,
  logStripeAction('subscription-stats'),
  async (req, res) => {
    try {
      const result = await stripeClient.getSubscriptionStats();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao gerar estatísticas',
        details: error.message
      });
    }
  }
);

// ==================== WEBHOOK ====================

/**
 * POST /api/stripe/webhook
 * Webhook do Stripe (sem autenticação)
 */
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'];
      // Verificar webhook
      const verification = stripeClient.verifyWebhook(req.body, signature);
      
      if (!verification.success) {
        console.error('Webhook verification failed:', verification.error);
        return res.status(400).json({ error: 'Webhook verification failed' });
      }
      const event = verification.event;
      
      console.log(`[Stripe Webhook] Received: ${event.type}`);
      // Processar evento
      const result = await stripeClient.processWebhookEvent(event);
      if (result.success) {
        // Atualizar dados no Supabase baseado na ação
        await updateSupabaseFromWebhook(result, event);
      }
      res.json({ received: true, processed: result.success });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Atualizar Supabase baseado no webhook
 */
async function updateSupabaseFromWebhook(result, event) {
  try {
    const { action } = result;
    const object = event.data.object;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const clinicId = object.metadata.clinic_id;
        const clinicName = object.metadata.clinic_name;
        const product = object.items.data[0].price.product;
        let planType = 'individual';
        if (product === process.env.STRIPE_PRODUCT_CLINICA_ID) {
          planType = 'clinica';
        }

        await supabase
          .from('clinicas')
          .update({ plano_atual: planType, subscription_status: object.status })
          .eq('id', clinicId);

        if (event.type === 'customer.subscription.created' && clinicId && clinicName) {
          const { data: existingAdmin, error: adminError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('clinica_id', clinicId)
            .eq('role', 'admin')
            .single();

          if (adminError && adminError.code === 'PGRST116') {
            await createClinicAdmin(clinicId, clinicName);
          } else if (adminError) {
            console.error('Erro ao verificar admin existente:', adminError);
          }
        }
        break;
      case 'customer.subscription.deleted':
        await supabase
          .from('clinicas')
          .update({ plano_atual: 'cancelado', subscription_status: object.status })
          .eq('stripe_customer_id', object.customer);
        break;
      case 'invoice.payment_succeeded':
        await supabase
          .from('clinicas')
          .update({
            status: 'active',
            last_payment_at: new Date().toISOString(),
            payment_status: 'paid'
          })
          .eq('stripe_customer_id', object.customer);
        break;
      case 'invoice.payment_failed':
        await supabase
          .from('clinicas')
          .update({
            payment_status: 'failed',
            payment_failed_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', object.customer);
        break;
    }

    // Log do evento
    await supabase
      .from('stripe_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed_action: action,
        object_id: object.id,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error updating Supabase from webhook:', error);
  }
}

async function createClinicAdmin(clinicId, clinicName) {
  try {
    const adminEmail = `admin@${clinicName.toLowerCase().replace(/\s/g, ".")}.regiflex`;
        const adminPassword = provisioningService.generateTempPassword();

    // Criar usuário no Supabase Auth
    const { data: userAuth, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (authError) {
      console.error("Erro ao criar usuário admin no Supabase Auth:", authError);
      return { success: false, error: authError.message };
    }

    // Inserir usuário na tabela 'usuarios' com role 'admin'
    const { data: userProfile, error: profileError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: userAuth.user.id,
          username: `admin_${clinicName.toLowerCase().replace(/\s/g, "")}`,
          email: adminEmail,
          role: "admin",
          clinica_id: clinicId,
        },
      ]);

    if (profileError) {
      console.error("Erro ao inserir perfil de usuário admin:", profileError);
      return { success: false, error: profileError.message };
    }

    console.log(`Admin ${adminEmail} criado para a clínica ${clinicName}`);
    return { success: true, user: userAuth.user };
  } catch (error) {
    console.error("Erro inesperado ao criar admin da clínica:", error);
    return { success: false, error: error.message };
  }
}

export default router;


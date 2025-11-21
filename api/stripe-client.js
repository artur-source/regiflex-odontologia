import Stripe from 'stripe';

/**
 * Cliente Stripe Completo para RegiFlex
 * 
 * Gerencia todas as operações de pagamento:
 * - Customers (Clientes)
 * - Products & Prices (Produtos e Preços)
 * - Subscriptions (Assinaturas)
 * - Payment Methods (Métodos de Pagamento)
 * - Invoices (Faturas)
 * - Webhooks (Eventos)
 */

class StripeClient {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  // ==================== CUSTOMERS ====================

  /**
   * Criar novo cliente no Stripe
   */
  async createCustomer(customerData) {
    try {
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        metadata: {
          clinic_id: customerData.clinic_id,
          plan_type: customerData.plan_type,
          created_via: 'regiflex_api'
        },
        address: customerData.address ? {
          line1: customerData.address.street,
          line2: customerData.address.complement,
          city: customerData.address.city,
          state: customerData.address.state,
          postal_code: customerData.address.zip_code,
          country: 'BR'
        } : undefined,
        tax_ids: customerData.cnpj ? [{
          type: 'br_cnpj',
          value: customerData.cnpj.replace(/[^\d]/g, '')
        }] : undefined
      });

      return {
        success: true,
        customer: customer,
        customer_id: customer.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Buscar cliente por email
   */
  async findCustomerByEmail(email) {
    try {
      const customers = await this.stripe.customers.list({
        email: email,
        limit: 1
      });

      return {
        success: true,
        customer: customers.data.length > 0 ? customers.data[0] : null,
        found: customers.data.length > 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar dados do cliente
   */
  async updateCustomer(customerId, updateData) {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        metadata: updateData.metadata
      });

      return {
        success: true,
        customer: customer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== PRODUCTS & PRICES ====================

  /**
   * Criar produto no Stripe
   */
  async createProduct(productData) {
    try {
      const product = await this.stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          plan_type: productData.plan_type,
          features: JSON.stringify(productData.features || [])
        },
        images: productData.images || []
      });

      return {
        success: true,
        product: product,
        product_id: product.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Criar preço para produto
   */
  async createPrice(priceData) {
    try {
      const price = await this.stripe.prices.create({
        product: priceData.product_id,
        unit_amount: priceData.unit_amount, // Valor em centavos
        currency: priceData.currency || 'brl',
        recurring: priceData.recurring ? {
          interval: priceData.recurring.interval || 'month',
          interval_count: priceData.recurring.interval_count || 1
        } : undefined,
        metadata: {
          plan_type: priceData.plan_type,
          billing_cycle: priceData.recurring?.interval || 'one_time'
        }
      });

      return {
        success: true,
        price: price,
        price_id: price.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listar todos os produtos ativos
   */
  async listProducts() {
    try {
      const products = await this.stripe.products.list({
        active: true,
        expand: ['data.default_price']
      });

      return {
        success: true,
        products: products.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Criar assinatura para cliente
   */
  async createSubscription(subscriptionData) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: subscriptionData.customer_id,
        items: [{
          price: subscriptionData.price_id,
          quantity: subscriptionData.quantity || 1
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          clinic_id: subscriptionData.clinic_id,
          plan_type: subscriptionData.plan_type,
          created_via: 'regiflex_api'
        },
        trial_period_days: subscriptionData.trial_days || 0,
        billing_cycle_anchor: subscriptionData.billing_anchor,
        proration_behavior: 'create_prorations'
      });

      return {
        success: true,
        subscription: subscription,
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent?.client_secret,
        status: subscription.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Atualizar assinatura
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: updateData.items ? [{
          id: updateData.subscription_item_id,
          price: updateData.new_price_id,
          quantity: updateData.quantity
        }] : undefined,
        proration_behavior: 'create_prorations',
        metadata: updateData.metadata
      });

      return {
        success: true,
        subscription: subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId, cancelData = {}) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelData.at_period_end !== false,
        cancellation_details: {
          comment: cancelData.reason || 'Cancelamento solicitado pelo cliente',
          feedback: cancelData.feedback || 'other'
        },
        metadata: {
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelData.cancelled_by || 'customer'
        }
      });

      return {
        success: true,
        subscription: subscription,
        cancelled_at: subscription.canceled_at,
        cancel_at_period_end: subscription.cancel_at_period_end
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reativar assinatura cancelada
   */
  async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
        cancellation_details: null,
        metadata: {
          reactivated_at: new Date().toISOString()
        }
      });

      return {
        success: true,
        subscription: subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== PAYMENT METHODS ====================

  /**
   * Listar métodos de pagamento do cliente
   */
  async listPaymentMethods(customerId, type = 'card') {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: type
      });

      return {
        success: true,
        payment_methods: paymentMethods.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Definir método de pagamento padrão
   */
  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      return {
        success: true,
        customer: customer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remover método de pagamento
   */
  async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);

      return {
        success: true,
        payment_method: paymentMethod
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== INVOICES ====================

  /**
   * Listar faturas do cliente
   */
  async listInvoices(customerId, limit = 10) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit: limit
      });

      return {
        success: true,
        invoices: invoices.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retry de pagamento de fatura
   */
  async retryInvoicePayment(invoiceId) {
    try {
      const invoice = await this.stripe.invoices.pay(invoiceId);

      return {
        success: true,
        invoice: invoice,
        status: invoice.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // ==================== PAYMENT INTENTS ====================

  /**
   * Criar Payment Intent para pagamento único
   */
  async createPaymentIntent(paymentData) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency || 'brl',
        customer: paymentData.customer_id,
        payment_method_types: paymentData.payment_methods || ['card', 'pix'],
        metadata: {
          clinic_id: paymentData.clinic_id,
          plan_type: paymentData.plan_type,
          payment_type: 'one_time'
        },
        receipt_email: paymentData.receipt_email,
        description: paymentData.description
      });

      return {
        success: true,
        payment_intent: paymentIntent,
        client_secret: paymentIntent.client_secret
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== CHECKOUT SESSIONS ====================

  /**
   * Criar sessão de checkout
   */
  async createCheckoutSession(checkoutData) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: checkoutData.customer_id,
        payment_method_types: checkoutData.payment_methods || ['card', 'pix'],
        line_items: [{
          price: checkoutData.price_id,
          quantity: checkoutData.quantity || 1
        }],
        mode: checkoutData.mode || 'subscription',
        success_url: checkoutData.success_url,
        cancel_url: checkoutData.cancel_url,
        metadata: {
          clinic_id: checkoutData.clinic_id,
          plan_type: checkoutData.plan_type
        },
        subscription_data: checkoutData.mode === 'subscription' ? {
          metadata: {
            clinic_id: checkoutData.clinic_id,
            plan_type: checkoutData.plan_type
          },
          trial_period_days: checkoutData.trial_days
        } : undefined,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true
        }
      });

      return {
        success: true,
        session: session,
        checkout_url: session.url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== COUPONS & DISCOUNTS ====================

  /**
   * Criar cupom de desconto
   */
  async createCoupon(couponData) {
    try {
      const coupon = await this.stripe.coupons.create({
        id: couponData.code,
        percent_off: couponData.percent_off,
        amount_off: couponData.amount_off,
        currency: couponData.currency || 'brl',
        duration: couponData.duration || 'once',
        duration_in_months: couponData.duration_in_months,
        max_redemptions: couponData.max_redemptions,
        redeem_by: couponData.expires_at,
        metadata: {
          campaign: couponData.campaign,
          created_via: 'regiflex_api'
        }
      });

      return {
        success: true,
        coupon: coupon
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aplicar cupom à assinatura
   */
  async applyCouponToSubscription(subscriptionId, couponId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        coupon: couponId
      });

      return {
        success: true,
        subscription: subscription,
        discount: subscription.discount
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Verificar webhook do Stripe
   */
  verifyWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        success: true,
        event: event
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar evento de webhook
   */
  async processWebhookEvent(event) {
    try {
      const { type, data } = event;
      const object = data.object;

      switch (type) {
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(object);
        
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(object);
        
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(object);
        
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(object);
        
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(object);
        
        case 'customer.created':
          return await this.handleCustomerCreated(object);
        
        default:
          return {
            success: true,
            message: `Evento ${type} recebido mas não processado`,
            processed: false
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        event_type: event.type
      };
    }
  }

  // ==================== WEBHOOK HANDLERS ====================

  async handleSubscriptionCreated(subscription) {
    // Ativar conta da clínica
    return {
      success: true,
      action: 'activate_clinic',
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      status: subscription.status
    };
  }

  async handleSubscriptionUpdated(subscription) {
    // Atualizar status da conta
    return {
      success: true,
      action: 'update_clinic_status',
      subscription_id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end
    };
  }

  async handleSubscriptionDeleted(subscription) {
    // Desativar conta da clínica
    return {
      success: true,
      action: 'deactivate_clinic',
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      cancelled_at: subscription.canceled_at
    };
  }

  async handlePaymentSucceeded(invoice) {
    // Ativar/manter conta ativa
    return {
      success: true,
      action: 'payment_success',
      invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount_paid: invoice.amount_paid,
      subscription_id: invoice.subscription
    };
  }

  async handlePaymentFailed(invoice) {
    // Suspender conta ou enviar aviso
    return {
      success: true,
      action: 'payment_failed',
      invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount_due: invoice.amount_due,
      subscription_id: invoice.subscription,
      attempt_count: invoice.attempt_count
    };
  }

  async handleCustomerCreated(customer) {
    // Log do novo cliente
    return {
      success: true,
      action: 'customer_created',
      customer_id: customer.id,
      email: customer.email
    };
  }

  // ==================== REPORTS & ANALYTICS ====================

  /**
   * Relatório de receita
   */
  async getRevenueReport(startDate, endDate) {
    try {
      const charges = await this.stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      });

      const totalRevenue = charges.data
        .filter(charge => charge.paid)
        .reduce((sum, charge) => sum + charge.amount, 0);

      return {
        success: true,
        period: { start: startDate, end: endDate },
        total_charges: charges.data.length,
        total_revenue: totalRevenue,
        average_charge: totalRevenue / charges.data.length || 0,
        charges: charges.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Estatísticas de assinaturas
   */
  async getSubscriptionStats() {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        status: 'all',
        limit: 100
      });

      const stats = subscriptions.data.reduce((acc, sub) => {
        acc.total++;
        acc.by_status[sub.status] = (acc.by_status[sub.status] || 0) + 1;
        
        if (sub.status === 'active') {
          acc.monthly_revenue += sub.items.data[0]?.price?.unit_amount || 0;
        }
        
        return acc;
      }, {
        total: 0,
        by_status: {},
        monthly_revenue: 0
      });

      return {
        success: true,
        stats: stats,
        subscriptions: subscriptions.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instância singleton
const stripeClient = new StripeClient();

export default stripeClient;
export { StripeClient };

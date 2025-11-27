import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabaseClient';

// Carregar Stripe (usar chave pública)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Componente Principal de Checkout Stripe
 */
export default function StripeCheckout({ planType, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="stripe-checkout">
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          planType={planType}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  );
}

/**
 * Formulário de Checkout
 */
function CheckoutForm({ planType, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    address: {
      street: '',
      complement: '',
      city: '',
      state: '',
      zip_code: ''
    }
  });

  const plans = {
    individual: {
      name: 'RegiFlex Individual',
      price: 3490, // R$ 34,90 em centavos
      description: 'Plano para psicólogos autônomos',
      features: [
        'Gestão de até 50 pacientes',
        'Agendamento de sessões',
        'Relatórios básicos',
        'Suporte por email'
      ]
    },
    clinica: {
      name: 'RegiFlex Clínica',
      price: 9990, // R$ 99,90 em centavos
      description: 'Plano para clínicas com múltiplos profissionais',
      features: [
        'Pacientes ilimitados',
        'Múltiplos usuários',
        'Relatórios avançados',
        'Suporte prioritário',
        'Integração com sistemas'
      ]
    }
  };

  const currentPlan = plans[planType] || plans.individual;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe não foi carregado corretamente');
      setLoading(false);
      return;
    }

    try {
      // 1. Criar cliente no Stripe
      const customerResponse = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          ...customerData,
          plan_type: planType
        })
      });

      const customerResult = await customerResponse.json();

      if (!customerResult.success) {
        throw new Error(customerResult.error);
      }

      // 2. Criar sessão de checkout
      const checkoutResponse = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          customer_id: customerResult.customer_id,
          price_id: getPriceId(planType),
          plan_type: planType,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout`,
          payment_methods: ['card', 'pix']
        })
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResult.success) {
        throw new Error(checkoutResult.error);
      }

      // 3. Redirecionar para checkout do Stripe
      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: checkoutResult.session.id
      });

      if (redirectError) {
        throw new Error(redirectError.message);
      }

    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomerData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomerData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="checkout-form">
      <div className="plan-summary">
        <h2>{currentPlan.name}</h2>
        <p className="plan-description">{currentPlan.description}</p>
        <div className="plan-price">
          <span className="currency">R$</span>
          <span className="amount">{(currentPlan.price / 100).toFixed(2)}</span>
          <span className="period">/mês</span>
        </div>
        
        <div className="plan-features">
          <h3>Incluído no plano:</h3>
          <ul>
            {currentPlan.features.map((feature, index) => (
              <li key={index}>✓ {feature}</li>
            ))}
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="customer-info">
          <h3>Informações de Cobrança</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="form-group">
              <label>CNPJ (opcional)</label>
              <input
                type="text"
                value={customerData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="address-section">
            <h4>Endereço</h4>
            
            <div className="form-group">
              <label>Rua</label>
              <input
                type="text"
                value={customerData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="Rua, número"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={customerData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={customerData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  {/* Adicionar outros estados */}
                </select>
              </div>
              
              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={customerData.address.zip_code}
                  onChange={(e) => handleInputChange('address.zip_code', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Forma de Pagamento</h3>
          
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Cartão de Crédito</span>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>🔲 PIX</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="submit-button"
        >
          {loading ? (
            <span>Processando...</span>
          ) : (
            <span>Assinar por R$ {(currentPlan.price / 100).toFixed(2)}/mês</span>
          )}
        </button>

        <div className="security-info">
          <p>🔒 Pagamento 100% seguro processado pelo Stripe</p>
          <p>✅ Cancele a qualquer momento</p>
          <p>📧 Recibo enviado por email</p>
        </div>
      </form>
    </div>
  );
}

/**
 * Componente para Gerenciar Assinatura Existente
 */
export function SubscriptionManager({ customerId, subscriptionId }) {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, [subscriptionId]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);

      // Carregar dados da assinatura
      const [subResponse, invoicesResponse, paymentMethodsResponse] = await Promise.all([
        fetch(`/api/stripe/subscription/${subscriptionId}`, {
          headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
        }),
        fetch(`/api/stripe/invoices/${customerId}`, {
          headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
        }),
        fetch(`/api/stripe/payment-methods/${customerId}`, {
          headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
        })
      ]);

      const [subData, invoicesData, paymentMethodsData] = await Promise.all([
        subResponse.json(),
        invoicesResponse.json(),
        paymentMethodsResponse.json()
      ]);

      setSubscription(subData.subscription);
      setInvoices(invoicesData.invoices || []);
      setPaymentMethods(paymentMethodsData.payment_methods || []);

    } catch (error) {
      console.error('Erro ao carregar dados da assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) {
      return;
    }

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          reason: 'Cancelamento solicitado pelo usuário'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Assinatura cancelada com sucesso!');
        loadSubscriptionData();
      } else {
        alert('Erro ao cancelar assinatura: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao cancelar assinatura');
    }
  };

  const handleRetryPayment = async (invoiceId) => {
    try {
      const response = await fetch('/api/stripe/retry-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ invoice_id: invoiceId })
      });

      const result = await response.json();

      if (result.success) {
        alert('Pagamento processado com sucesso!');
        loadSubscriptionData();
      } else {
        alert('Erro ao processar pagamento: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao tentar pagamento novamente');
    }
  };

  if (loading) {
    return <div className="loading">Carregando dados da assinatura...</div>;
  }

  return (
    <div className="subscription-manager">
      <div className="subscription-info">
        <h2>Minha Assinatura</h2>
        
        {subscription && (
          <div className="subscription-details">
            <div className="status-badge status-{subscription.status}">
              {getStatusText(subscription.status)}
            </div>
            
            <div className="subscription-data">
              <p><strong>Plano:</strong> {subscription.items.data[0]?.price?.nickname || 'RegiFlex'}</p>
              <p><strong>Valor:</strong> R$ {(subscription.items.data[0]?.price?.unit_amount / 100).toFixed(2)}/mês</p>
              <p><strong>Próxima cobrança:</strong> {new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')}</p>
              
              {subscription.cancel_at_period_end && (
                <p className="cancellation-notice">
                  ⚠️ Assinatura será cancelada em {new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            <div className="subscription-actions">
              {!subscription.cancel_at_period_end ? (
                <button 
                  onClick={handleCancelSubscription}
                  className="btn btn-danger"
                >
                  Cancelar Assinatura
                </button>
              ) : (
                <button 
                  onClick={() => reactivateSubscription(subscriptionId)}
                  className="btn btn-primary"
                >
                  Reativar Assinatura
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="invoices-section">
        <h3>Histórico de Pagamentos</h3>
        
        <div className="invoices-list">
          {invoices.map(invoice => (
            <div key={invoice.id} className="invoice-item">
              <div className="invoice-info">
                <span className="invoice-date">
                  {new Date(invoice.created * 1000).toLocaleDateString('pt-BR')}
                </span>
                <span className="invoice-amount">
                  R$ {(invoice.amount_paid / 100).toFixed(2)}
                </span>
                <span className={`invoice-status status-${invoice.status}`}>
                  {getInvoiceStatusText(invoice.status)}
                </span>
              </div>
              
              <div className="invoice-actions">
                {invoice.status === 'open' && (
                  <button 
                    onClick={() => handleRetryPayment(invoice.id)}
                    className="btn btn-sm btn-primary"
                  >
                    Tentar Pagamento
                  </button>
                )}
                
                {invoice.invoice_pdf && (
                  <a 
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="payment-methods-section">
        <h3>Métodos de Pagamento</h3>
        
        <div className="payment-methods-list">
          {paymentMethods.map(method => (
            <div key={method.id} className="payment-method-item">
              <div className="method-info">
                <span className="method-type">
                  {method.type === 'card' ? '💳' : '🔲'} 
                  {method.card ? `**** ${method.card.last4}` : method.type}
                </span>
                {method.card && (
                  <span className="method-details">
                    {method.card.brand.toUpperCase()} • Exp: {method.card.exp_month}/{method.card.exp_year}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

function getPriceId(planType) {
  const priceIds = {
    individual: 'price_1SGV4WCKzvrePtQOEucwQSYx',
    clinica: 'price_1SGV4bCKzvrePtQOGJRpBqhi'
  };
  return priceIds[planType] || priceIds.individual;
}

function getStatusText(status) {
  const statusTexts = {
    active: 'Ativo',
    canceled: 'Cancelado',
    incomplete: 'Incompleto',
    incomplete_expired: 'Expirado',
    past_due: 'Em atraso',
    trialing: 'Período de teste',
    unpaid: 'Não pago'
  };
  return statusTexts[status] || status;
}

function getInvoiceStatusText(status) {
  const statusTexts = {
    draft: 'Rascunho',
    open: 'Em aberto',
    paid: 'Pago',
    uncollectible: 'Não cobrável',
    void: 'Cancelado'
  };
  return statusTexts[status] || status;
}

async function reactivateSubscription(subscriptionId) {
  try {
    const response = await fetch('/api/stripe/reactivate-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ subscription_id: subscriptionId })
    });

    const result = await response.json();

    if (result.success) {
      alert('Assinatura reativada com sucesso!');
      window.location.reload();
    } else {
      alert('Erro ao reativar assinatura: ' + result.error);
    }
  } catch (error) {
    alert('Erro ao reativar assinatura');
  }
}

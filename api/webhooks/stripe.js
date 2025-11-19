const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  // Usar uma chave secreta específica para o webhook de Odontologia
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_ODONTOLOGIA;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Retornar erro se a assinatura for inválida
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar o evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Lógica para atualizar o status de pagamento na tabela odontologia_faturamento
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      
      // Exemplo de atualização no Supabase (necessita de metadados no PaymentIntent para identificar o faturamento)
      const faturamentoId = paymentIntent.metadata.faturamento_id;
      if (faturamentoId) {
        const { data, error } = await supabase
          .from('odontologia_faturamento')
          .update({ 
            status_pagamento: 'pago',
            stripe_payment_id: paymentIntent.id,
            valor_pago: paymentIntent.amount / 100 // Converter centavos para reais
          })
          .eq('id', faturamentoId);

        if (error) {
          console.error('Erro ao atualizar faturamento no Supabase:', error);
        }
      }
      break;
    case 'customer.subscription.created':
      // Lógica para provisionamento de acesso ao módulo Odontologia (se for o primeiro módulo)
      console.log(`Subscription created for customer ${event.data.object.customer}`);
      break;
    // Outros eventos relevantes para Odontologia (ex: invoice.payment_failed)
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Retornar uma resposta 200 para o Stripe
  res.json({ received: true });
};

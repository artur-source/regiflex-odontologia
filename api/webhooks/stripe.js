import Stripe from 'stripe'
import { provisioningService } from '../provisioning.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Webhook do Stripe para processar eventos de pagamento
 * 
 * Este endpoint recebe eventos do Stripe e processa:
 * - Criação de assinaturas
 * - Atualizações de assinaturas  
 * - Cancelamentos
 * - Pagamentos bem-sucedidos/falhados
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('❌ Erro na verificação do webhook:', err.message)
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` })
  }

  try {
    // Processar evento
    await provisioningService.processStripeWebhook(event)
    
    console.log(`✅ Webhook processado: ${event.type}`)
    res.status(200).json({ received: true })
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Configuração para Next.js/Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

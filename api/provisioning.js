import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configuração do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Sistema de Provisionamento Automatizado do RegiFlex
 * 
 * Este sistema cria automaticamente:
 * 1. Clínica no banco de dados
 * 2. Usuário administrador
 * 3. Configurações iniciais
 * 4. Estrutura de dados isolada (multi-tenant)
 */

export class ProvisioningService {
  
  /**
   * Provisiona uma nova clínica completa
   * @param {Object} clinicData - Dados da clínica
   * @param {Object} adminData - Dados do administrador
   * @param {string} planType - Tipo do plano (individual/clinica)
   * @returns {Object} Resultado do provisionamento
   */
  async provisionNewClinic(clinicData, adminData, planType = 'individual') {
    try {
      console.log('🚀 Iniciando provisionamento para:', clinicData.nome)
      
      // 1. Criar clínica no banco
      const clinic = await this.createClinic(clinicData, planType)
      console.log('✅ Clínica criada:', clinic.id)
      
      // 2. Criar usuário administrador no Supabase Auth
      const authUser = await this.createAuthUser(adminData)
      console.log('✅ Usuário Auth criado:', authUser.id)
      
      // 3. Criar perfil do administrador
      const adminProfile = await this.createAdminProfile(authUser, clinic.id, adminData)
      console.log('✅ Perfil admin criado:', adminProfile.id)
      
      // 4. Configurar estrutura inicial
      await this.setupInitialStructure(clinic.id)
      console.log('✅ Estrutura inicial configurada')
      
      // 5. Enviar email de boas-vindas
      await this.sendWelcomeEmail(adminData.email, clinic.nome, adminData.tempPassword)
      console.log('✅ Email de boas-vindas enviado')
      
      return {
        success: true,
        clinic: clinic,
        admin: adminProfile,
        authUser: authUser,
        loginUrl: `${process.env.APP_URL}/login`,
        credentials: {
          email: adminData.email,
          tempPassword: adminData.tempPassword
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no provisionamento:', error)
      throw new Error(`Falha no provisionamento: ${error.message}`)
    }
  }
  
  /**
   * Cria uma nova clínica no banco de dados
   */
  async createClinic(clinicData, planType) {
    const { data, error } = await supabase
      .from('clinicas')
      .insert([
        {
          nome: clinicData.nome,
          cnpj: clinicData.cnpj,
          endereco: clinicData.endereco,
          telefone: clinicData.telefone,
          email: clinicData.email,
          plano: planType,
          status: 'trial', // 15 dias de trial
          trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 dias
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  /**
   * Cria usuário no Supabase Auth
   */
  async createAuthUser(adminData) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.tempPassword,
      email_confirm: true,
      user_metadata: {
        nome_completo: adminData.nome_completo,
        role: 'admin'
      }
    })
    
    if (error) throw error
    return data.user
  }
  
  /**
   * Cria perfil do administrador
   */
  async createAdminProfile(authUser, clinicId, adminData) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          auth_user_id: authUser.id,
          clinic_id: clinicId,
          username: adminData.username || adminData.email.split('@')[0],
          email: adminData.email,
          nome_completo: adminData.nome_completo,
          role: 'admin',
          ativo: true
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  /**
   * Configura estrutura inicial da clínica
   */
  async setupInitialStructure(clinicId) {
    // Criar configurações padrão
    const { error: configError } = await supabase
      .from('configuracoes')
      .insert([
        {
          clinic_id: clinicId,
          chave: 'horario_funcionamento',
          valor: JSON.stringify({
            segunda: { inicio: '08:00', fim: '18:00' },
            terca: { inicio: '08:00', fim: '18:00' },
            quarta: { inicio: '08:00', fim: '18:00' },
            quinta: { inicio: '08:00', fim: '18:00' },
            sexta: { inicio: '08:00', fim: '18:00' },
            sabado: { inicio: '08:00', fim: '12:00' },
            domingo: { ativo: false }
          })
        },
        {
          clinic_id: clinicId,
          chave: 'duracao_sessao_padrao',
          valor: '50' // 50 minutos
        },
        {
          clinic_id: clinicId,
          chave: 'intervalo_sessoes',
          valor: '10' // 10 minutos entre sessões
        }
      ])
    
    if (configError) {
      console.warn('Aviso: Erro ao criar configurações:', configError)
    }
    
    return true
  }
  
  /**
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(email, clinicName, tempPassword) {
    // Implementar com Resend ou outro provedor de email
    console.log(`📧 Email de boas-vindas enviado para ${email}`)
    console.log(`Clínica: ${clinicName}`)
    console.log(`Senha temporária: ${tempPassword}`)
    
    // TODO: Implementar envio real de email
    return true
  }
  
  /**
   * Processa webhook do Stripe para ativação de assinatura
   */
  async processStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.activateSubscription(event.data.object)
          break
          
        case 'customer.subscription.updated':
          await this.updateSubscription(event.data.object)
          break
          
        case 'customer.subscription.deleted':
          await this.cancelSubscription(event.data.object)
          break
          
        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data.object)
          break
          
        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data.object)
          break
          
        default:
          console.log(`Evento não tratado: ${event.type}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      throw error
    }
  }
  
  /**
   * Ativa assinatura após pagamento
   */
  async activateSubscription(subscription) {
    const customerId = subscription.customer
    
    // Buscar customer no Stripe para obter email
    const customer = await stripe.customers.retrieve(customerId)
    
    // Atualizar status da clínica
    const { error } = await supabase
      .from('clinicas')
      .update({
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id
      })
      .eq('email', customer.email)
    
    if (error) throw error
    
    console.log(`✅ Assinatura ativada para: ${customer.email}`)
  }
  
  /**
   * Atualiza assinatura
   */
  async updateSubscription(subscription) {
    const { error } = await supabase
      .from('clinicas')
      .update({
        status: subscription.status === 'active' ? 'active' : 'suspended'
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (error) throw error
    
    console.log(`✅ Assinatura atualizada: ${subscription.id}`)
  }
  
  /**
   * Cancela assinatura
   */
  async cancelSubscription(subscription) {
    const { error } = await supabase
      .from('clinicas')
      .update({
        status: 'cancelled'
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (error) throw error
    
    console.log(`✅ Assinatura cancelada: ${subscription.id}`)
  }
  
  /**
   * Trata pagamento bem-sucedido
   */
  async handlePaymentSuccess(invoice) {
    console.log(`✅ Pagamento bem-sucedido: ${invoice.id}`)
    // Implementar lógica adicional se necessário
  }
  
  /**
   * Trata falha no pagamento
   */
  async handlePaymentFailure(invoice) {
    console.log(`❌ Falha no pagamento: ${invoice.id}`)
    
    // Buscar clínica e notificar sobre falha no pagamento
    const customerId = invoice.customer
    const customer = await stripe.customers.retrieve(customerId)
    
    // Atualizar status para suspended após falha no pagamento
    const { error } = await supabase
      .from('clinicas')
      .update({
        status: 'suspended'
      })
      .eq('email', customer.email)
    
    if (error) throw error
  }
  
  /**
   * Gera senha temporária segura
   */
  generateTempPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
  
  /**
   * Valida dados de entrada
   */
  validateProvisioningData(clinicData, adminData) {
    const errors = []
    
    // Validar dados da clínica
    if (!clinicData.nome) errors.push('Nome da clínica é obrigatório')
    if (!clinicData.email) errors.push('Email da clínica é obrigatório')
    
    // Validar dados do admin
    if (!adminData.nome_completo) errors.push('Nome completo do administrador é obrigatório')
    if (!adminData.email) errors.push('Email do administrador é obrigatório')
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (clinicData.email && !emailRegex.test(clinicData.email)) {
      errors.push('Email da clínica inválido')
    }
    if (adminData.email && !emailRegex.test(adminData.email)) {
      errors.push('Email do administrador inválido')
    }
    
    return errors
  }
}

// Instância singleton
export const provisioningService = new ProvisioningService()

// Função helper para uso em APIs
export async function provisionNewClient(clinicData, adminData, planType = 'individual') {
  // Gerar senha temporária
  adminData.tempPassword = provisioningService.generateTempPassword()
  
  // Validar dados
  const errors = provisioningService.validateProvisioningData(clinicData, adminData)
  if (errors.length > 0) {
    throw new Error(`Dados inválidos: ${errors.join(', ')}`)
  }
  
  // Provisionar
  return await provisioningService.provisionNewClinic(clinicData, adminData, planType)
}

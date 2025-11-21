import { provisionNewClient } from './provisioning.js'

/**
 * API para provisionamento manual de novos clientes
 * 
 * POST /api/provision-client
 * 
 * Body:
 * {
 *   "clinic": {
 *     "nome": "Clínica Exemplo",
 *     "email": "contato@clinica.com",
 *     "cnpj": "12.345.678/0001-90",
 *     "endereco": "Rua Exemplo, 123",
 *     "telefone": "(11) 99999-9999"
 *   },
 *   "admin": {
 *     "nome_completo": "Dr. João Silva",
 *     "email": "joao@clinica.com",
 *     "username": "joao.silva"
 *   },
 *   "plan": "individual" // ou "clinica"
 * }
 */

export default async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Este endpoint aceita apenas requisições POST'
    })
  }

  try {
    const { clinic, admin, plan = 'individual' } = req.body

    // Validar dados obrigatórios
    if (!clinic || !admin) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'É necessário fornecer dados da clínica e do administrador'
      })
    }

    console.log('🚀 Iniciando provisionamento via API:', clinic.nome)

    // Provisionar novo cliente
    const result = await provisionNewClient(clinic, admin, plan)

    console.log('✅ Provisionamento concluído:', result.clinic.id)

    // Retornar resultado
    res.status(201).json({
      success: true,
      message: 'Cliente provisionado com sucesso',
      data: {
        clinic: {
          id: result.clinic.id,
          nome: result.clinic.nome,
          email: result.clinic.email,
          plano: result.clinic.plano,
          status: result.clinic.status,
          trial_ends_at: result.clinic.trial_ends_at
        },
        admin: {
          id: result.admin.id,
          nome_completo: result.admin.nome_completo,
          email: result.admin.email,
          username: result.admin.username
        },
        access: {
          login_url: result.loginUrl,
          email: result.credentials.email,
          temp_password: result.credentials.tempPassword
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro no provisionamento via API:', error)

    // Retornar erro detalhado
    res.status(500).json({
      success: false,
      error: 'Erro no provisionamento',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
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

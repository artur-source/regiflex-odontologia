import SupabaseApiService from './supabaseApi';
const supabase = SupabaseApiService.supabase;

// Função para chamar a Edge Function de IA
const predictNoShow = async (sessionId) => {
  try {
    // A URL da Edge Function segue o padrão:
    // [SUPABASE_URL]/functions/v1/[FUNCTION_NAME]
    const SUPABASE_URL = "https://upbsldljfejaieuveknr.supabase.co"; // URL do projeto Supabase
    const FUNCTION_NAME = "predict-no-show";
    const url = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // A chave anon pode ser usada para Edge Functions
        'Authorization': `Bearer ${supabase.supabaseKey}` 
      },
      body: JSON.stringify({ session_id: sessionId })
    });

    if (!response.ok) {
      // Se a função não estiver deployada, o status pode ser 404 ou 500.
      // Vamos tentar ler a resposta para um erro mais detalhado.
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignora erro de parsing se a resposta não for JSON
      }
      
      // Lança um erro para ser capturado no catch e simular a resposta
      throw new Error(errorData.error || `Erro na chamada da Edge Function: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erro ao prever no-show (Simulação ativada):', error);
    
    // --- SIMULAÇÃO DE RESPOSTA DA IA (Caso a Edge Function não esteja deployada) ---
    const risk_percentage = Math.floor(Math.random() * 100);
    const is_high_risk = risk_percentage > 70; // Alto risco acima de 70%
    
    return {
      session_id: sessionId,
      risk_percentage: risk_percentage,
      is_high_risk: is_high_risk,
      features_used: {},
      alert_message: `SIMULAÇÃO: Risco de no-show: ${risk_percentage}%. (Edge Function não deployada)`
    };
  }
};


const apiService = {
  // Funções de Sessões
  getSessoes: async (filters = {}) => {
    let query = supabase.from('sessoes').select(`
      *,
      paciente:pacientes(nome_completo)
    `);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.paciente_id) {
      query = query.eq('paciente_id', filters.paciente_id);
    }

    const { data, error } = await query.order('data_hora', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar sessões: ${error.message}`);
    }

    // Adaptação dos dados para incluir o nome do paciente
    const sessoesComNome = data.map(sessao => ({
      ...sessao,
      paciente: sessao.paciente || { nome_completo: 'Paciente Desconhecido' }
    }));

    return { sessoes: sessoesComNome };
  },

  createSessao: async (sessaoData) => {
    const { data, error } = await supabase.from('sessoes').insert([
      { ...sessaoData, status: 'agendada' }
    ]).select();

    if (error) {
      throw new Error(`Erro ao criar sessão: ${error.message}`);
    }
    return data;
  },

  updateSessao: async (id, sessaoData) => {
    const { data, error } = await supabase.from('sessoes').update(sessaoData).eq('id', id).select();

    if (error) {
      throw new Error(`Erro ao atualizar sessão: ${error.message}`);
    }
    return data;
  },

  // Funções de Pacientes (simplificadas)
  getPacientes: async (page = 1, limit = 10) => {
    const { data, error } = await supabase.from('pacientes').select('*').range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar pacientes: ${error.message}`);
    }
    return { pacientes: data };
  },

  // Nova função de IA
  predictNoShow,
};

export default apiService;

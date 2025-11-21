import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Inicializa o cliente Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
)

// Módulo de IA
const MODULE_NAME = "psicologia"

// Função de ativação Sigmoid
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { session_id } = await req.json()

    if (!session_id) {
      return new Response(JSON.stringify({ error: "Missing session_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 1. Buscar dados da sessão no Supabase
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessoes")
      .select("data_hora, created_at, duracao_minutos")
      .eq("id", session_id)
      .single()

    if (sessionError || !sessionData) {
      console.error("Error fetching session data:", sessionError?.message)
      return new Response(JSON.stringify({ error: "Session not found or database error" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 2. Pré-processamento e Feature Engineering (Deve ser idêntico ao Python)
    const dataHora = new Date(sessionData.data_hora)
    const createdAt = new Date(sessionData.created_at)

    // Calcula a diferença em dias (antecedência)
    const diffTime = Math.abs(dataHora.getTime() - createdAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const features = {
      dia_da_semana: dataHora.getDay(), // 0 (Dom) a 6 (Sáb)
      hora_do_dia: dataHora.getHours(),
      antecedencia_agendamento: diffDays,
      duracao_minutos: sessionData.duracao_minutos,
    }
    
    // 3. Buscar Coeficientes do Modelo no Supabase
    const { data: modelParams, error: paramsError } = await supabase
      .from("model_parameters")
      .select("feature_weights, intercept")
      .eq("module_name", MODULE_NAME)
      .single()

    if (paramsError || !modelParams) {
      console.error("Error fetching model parameters:", paramsError?.message)
      // Retorna um erro ou um valor padrão seguro
      return new Response(JSON.stringify({ error: "Model parameters not found for this module." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 4. Realizar a Inferência Matemática (Regressão Logística)
    const weights = modelParams.feature_weights
    const intercept = modelParams.intercept
    
    let z = intercept
    
    // Cálculo do produto escalar (w * x)
    for (const feature in weights) {
      // O nome da feature no DB deve corresponder ao nome no objeto 'features'
      const weight = weights[feature]
      const featureValue = features[feature as keyof typeof features]
      
      if (weight !== undefined && featureValue !== undefined) {
        z += weight * featureValue
      } else {
        console.warn(`Feature ou peso não encontrado: ${feature}`)
      }
    }

    // Aplica a função Sigmoid para obter a probabilidade (0 a 1)
    const probability = sigmoid(z)
    
    // A probabilidade de no-show é 1 - probabilidade de comparecer (ou vice-versa, dependendo do treinamento)
    // Assumindo que o modelo treinou 1 para 'no-show', a probabilidade é de no-show.
    const risk_percentage = Math.round(probability * 100)
    const is_high_risk = risk_percentage > 50

    const prediction_result = {
      session_id: session_id,
      risk_percentage: risk_percentage,
      is_high_risk: is_high_risk,
      features_used: features,
      alert_message: is_high_risk
        ? `ALERTA: Alto risco de no-show (${risk_percentage}%). Considere um lembrete.`
        : `Risco de no-show baixo (${risk_percentage}%).`,
    }

    // 5. Retornar o resultado
    return new Response(JSON.stringify(prediction_result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

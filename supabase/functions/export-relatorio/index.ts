import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Inicializa o cliente Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
)

// Função para converter dados para CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return ""
  }

  // Obtém as colunas do primeiro objeto
  const columns = Object.keys(data[0])
  
  // Cria o header do CSV
  const header = columns.map(col => `"${col}"`).join(",")
  
  // Cria as linhas do CSV
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col]
      // Escapa aspas duplas e envolve em aspas se contiver vírgula
      if (value === null || value === undefined) {
        return '""'
      }
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(",")
  })
  
  return [header, ...rows].join("\n")
}

// Função para converter dados para PDF (simulado como texto formatado)
function convertToPDF(data: any[], stats: any): string {
  let content = "RELATÓRIO DE SESSÕES - RegiFlex\n"
  content += "================================\n\n"
  
  if (stats) {
    content += "ESTATÍSTICAS GERAIS\n"
    content += `Total de Sessões: ${stats.total_sessoes}\n`
    content += `Sessões Realizadas: ${stats.total_realizadas}\n`
    content += `Sessões Canceladas: ${stats.total_canceladas}\n`
    content += `Faltas: ${stats.total_faltas}\n`
    content += `Pacientes Ativos: ${stats.active_patients}\n\n`
  }
  
  content += "DETALHES DAS SESSÕES\n"
  content += "-------------------\n\n"
  
  data.forEach((row, index) => {
    content += `Sessão ${index + 1}:\n`
    Object.entries(row).forEach(([key, value]) => {
      content += `  ${key}: ${value}\n`
    })
    content += "\n"
  })
  
  return content
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { format, filters, stats } = await req.json()

    if (!format || !["csv", "pdf"].includes(format.toLowerCase())) {
      return new Response(JSON.stringify({ error: "Invalid format. Use 'csv' or 'pdf'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Buscar dados das sessões com filtros
    let query = supabase
      .from("sessoes")
      .select(`
        id,
        data_hora,
        duracao_minutos,
        status,
        tipo_sessao,
        observacoes,
        pacientes(nome_completo),
        usuarios(nome_completo)
      `)

    // Aplicar filtros
    if (filters?.startDate) {
      query = query.gte("data_hora", filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte("data_hora", filters.endDate)
    }
    if (filters?.paciente_id) {
      query = query.eq("paciente_id", filters.paciente_id)
    }
    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    const { data: sessoes, error } = await query

    if (error) {
      console.error("Error fetching sessions:", error.message)
      return new Response(JSON.stringify({ error: "Failed to fetch sessions" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Formatar dados para exportação
    const formattedData = (sessoes || []).map((sessao: any) => ({
      ID: sessao.id,
      "Data/Hora": new Date(sessao.data_hora).toLocaleString("pt-BR"),
      "Duração (min)": sessao.duracao_minutos,
      Status: sessao.status,
      "Tipo de Sessão": sessao.tipo_sessao,
      Paciente: sessao.pacientes?.nome_completo || "N/A",
      Profissional: sessao.usuarios?.nome_completo || "N/A",
      Observações: sessao.observacoes || "",
    }))

    let fileContent: string
    let contentType: string
    let filename: string

    if (format.toLowerCase() === "csv") {
      fileContent = convertToCSV(formattedData)
      contentType = "text/csv; charset=utf-8"
      filename = `relatorio_sessoes_${new Date().toISOString().split("T")[0]}.csv`
    } else {
      fileContent = convertToPDF(formattedData, stats)
      contentType = "text/plain; charset=utf-8"
      filename = `relatorio_sessoes_${new Date().toISOString().split("T")[0]}.txt`
    }

    return new Response(fileContent, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

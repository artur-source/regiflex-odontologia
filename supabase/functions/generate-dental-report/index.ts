import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { tenant_id, paciente_id, data_inicio, data_fim } = await req.json();

    // Validar parâmetros
    if (!tenant_id || !paciente_id) {
      return new Response(
        JSON.stringify({
          error: "tenant_id and paciente_id are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do paciente
    const { data: paciente } = await supabase
      .from("odontologia_pacientes")
      .select("*")
      .eq("id", paciente_id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!paciente) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar procedimentos do período
    const { data: procedimentos } = await supabase
      .from("odontologia_procedimentos")
      .select("*")
      .eq("paciente_id", paciente_id)
      .eq("tenant_id", tenant_id)
      .gte("data_procedimento", data_inicio)
      .lte("data_procedimento", data_fim);

    // Calcular totais
    const total_procedimentos = procedimentos?.length || 0;
    const valor_total = procedimentos?.reduce(
      (sum, p) => sum + (p.preco || 0),
      0
    );

    const relatorio = {
      paciente: paciente.nome,
      cpf: paciente.cpf,
      periodo: `${data_inicio} a ${data_fim}`,
      total_procedimentos,
      valor_total,
      procedimentos: procedimentos || [],
      data_geracao: new Date().toISOString(),
    };

    return new Response(JSON.stringify(relatorio), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate report",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

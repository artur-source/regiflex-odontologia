import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { image_url, tenant_id } = await req.json();

    // Validar tenant_id
    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "tenant_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Chamar Claude Vision para análise de imagem
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: image_url,
              },
            },
            {
              type: "text",
              text: `Você é um assistente de diagnóstico odontológico. Analise esta imagem clínica odontológica e forneça:
1. Achados principais (cáries, periodontite, restaurações, etc.)
2. Procedimentos recomendados
3. Nível de urgência (baixo, médio, alto)
4. Observações adicionais

Responda em JSON com as chaves: findings, recommendations, urgency, observations`,
            },
          ],
        },
      ],
    });

    const analysis_text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Tentar fazer parse do JSON
    let analysis_json;
    try {
      analysis_json = JSON.parse(analysis_text);
    } catch {
      analysis_json = { raw_analysis: analysis_text };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis_json,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze image",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

-- Função RPC para Relatórios Agregados do Módulo Odontologia
CREATE OR REPLACE FUNCTION get_aggregated_report_odontologia(
    tenant_id_filter UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result_json JSONB;
BEGIN
    -- 1. Filtrar procedimentos por tenant e período
    WITH filtered_procedimentos AS (
        SELECT
            p.id,
            p.tipo_procedimento,
            p.data_procedimento,
            f.valor_total,
            f.status_pagamento
        FROM
            odontologia_procedimentos p
        LEFT JOIN
            odontologia_faturamento f ON p.id = f.procedimento_id
        WHERE
            p.tenant_id = tenant_id_filter
            AND (start_date IS NULL OR p.data_procedimento >= start_date)
            AND (end_date IS NULL OR p.data_procedimento <= end_date)
    ),
    -- 2. Calcular métricas agregadas
    metrics AS (
        SELECT
            COUNT(DISTINCT p.paciente_id) AS total_pacientes,
            COUNT(fp.id) AS total_procedimentos,
            COALESCE(SUM(fp.valor_total), 0) AS faturamento_total,
            COALESCE(SUM(CASE WHEN fp.status_pagamento = 'pago' THEN fp.valor_total ELSE 0 END), 0) AS faturamento_pago,
            -- Agregação por tipo de procedimento
            jsonb_agg(jsonb_build_object('name', fp.tipo_procedimento, 'value', COUNT(fp.id))) FILTER (WHERE fp.tipo_procedimento IS NOT NULL) AS procedimentos_por_tipo
        FROM
            odontologia_pacientes p
        LEFT JOIN
            filtered_procedimentos fp ON p.id = fp.paciente_id
        WHERE
            p.tenant_id = tenant_id_filter
    ),
    -- 3. Agregação do Odontograma (Status dos Dentes)
    odontograma_stats AS (
        SELECT
            jsonb_agg(jsonb_build_object('name', o.status, 'value', COUNT(o.id))) AS status_odontograma
        FROM
            odontologia_odontograma o
        WHERE
            o.tenant_id = tenant_id_filter
    )
    -- 4. Construir o JSONB final
    SELECT
        jsonb_build_object(
            'total_pacientes', m.total_pacientes,
            'total_procedimentos', m.total_procedimentos,
            'faturamento_total', m.faturamento_total,
            'faturamento_pago', m.faturamento_pago,
            'procedimentos_por_tipo', m.procedimentos_por_tipo,
            'status_odontograma', os.status_odontograma
        ) INTO result_json
    FROM
        metrics m, odontograma_stats os;

    RETURN result_json;
END;
$$;

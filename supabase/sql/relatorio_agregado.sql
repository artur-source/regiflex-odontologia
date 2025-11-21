-- Função para calcular métricas agregadas de sessões
/* Julião: Analisar se há gargalo de performance quando há mais de 100.000 registros simultâneos. Considerar a criação de um índice composto em (tenant_id, data_sessao). (Desempenho) */
/* Julião: Analisar se há gargalo de performance quando há mais de 100.000 registros simultâneos. Considerar a criação de um índice composto em (tenant_id, data_sessao). (Desempenho) */
CREATE OR REPLACE FUNCTION get_aggregated_report(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    paciente_id_filter INT DEFAULT NULL,
    status_filter TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH filtered_sessoes AS (
        SELECT
            id,
            paciente_id,
            status,
            tipo_sessao,
            data_hora
        FROM
            sessoes
        WHERE
            (start_date IS NULL OR data_hora >= start_date)
            AND (end_date IS NULL OR data_hora <= end_date + INTERVAL '1 day') -- Inclui o final do dia
            AND (paciente_id_filter IS NULL OR paciente_id = paciente_id_filter)
            AND (status_filter IS NULL OR status = status_filter)
    ),
    session_counts AS (
        SELECT
            count(*) AS total_sessoes,
            count(CASE WHEN status = 'realizada' THEN 1 END) AS total_realizadas,
            count(CASE WHEN status = 'cancelada' THEN 1 END) AS total_canceladas,
            count(CASE WHEN status = 'faltou' THEN 1 END) AS total_faltas,
            count(CASE WHEN status = 'agendada' THEN 1 END) AS total_agendadas,
            count(DISTINCT paciente_id) AS active_patients
        FROM
            filtered_sessoes
    ),
    session_types AS (
        SELECT
            COALESCE(tipo_sessao, 'Nao Especificado') AS name,
            count(*) AS value
        FROM
            filtered_sessoes
        GROUP BY
            name
    )
    SELECT jsonb_build_object(
        'total_sessoes', sc.total_sessoes,
        'total_realizadas', sc.total_realizadas,
        'total_canceladas', sc.total_canceladas,
        'total_faltas', sc.total_faltas,
        'total_agendadas', sc.total_agendadas,
        'active_patients', sc.active_patients,
        'attendance_rate',
            CASE
                WHEN (sc.total_realizadas + sc.total_faltas) > 0 THEN
                    ROUND((sc.total_realizadas::NUMERIC / (sc.total_realizadas + sc.total_faltas)) * 100, 1)
                ELSE 0
            END,
        'cancellation_rate',
            CASE
                WHEN sc.total_sessoes > 0 THEN
                    ROUND(((sc.total_canceladas + sc.total_faltas)::NUMERIC / sc.total_sessoes) * 100, 1)
                ELSE 0
            END,
        'session_type_data', (SELECT jsonb_agg(t) FROM session_types t),
        'status_data', jsonb_build_array(
            jsonb_build_object('name', 'Realizada', 'total', sc.total_realizadas),
            jsonb_build_object('name', 'Faltou', 'total', sc.total_faltas),
            jsonb_build_object('name', 'Cancelada', 'total', sc.total_canceladas),
            jsonb_build_object('name', 'Agendada', 'total', sc.total_agendadas)
        )
    ) INTO result
    FROM session_counts sc;

    RETURN result;
END;
$$ LANGUAGE SQL
SET search_path = pg_catalog, public, pg_temp;

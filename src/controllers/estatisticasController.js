const pool = require('../../dbConfig');

exports.getEstatisticas = async (req, res) => {
  const idsLojas = JSON.parse(req.query.ids_lojas || '[]');
  if (!idsLojas.length) return res.status(400).json({ mensagem: 'Nenhuma loja encontrada' });

  try {

    // 1. Total de clientes distintos
    const queryTotalClientes = `
      SELECT COUNT(DISTINCT id_cliente_empresa) AS total
      FROM CLIENTES_EMPRESA
    `;

    // 2. Chamados abertos
    const queryChamadosAbertos = `
      SELECT COUNT(DISTINCT id_ticket) AS total
      FROM TICKETS_EMPRESA
      WHERE UPPER(status_ticket) = 'ABERTO'
        AND id_loja = ANY($1::int[])
    `;

    // 3. Taxa de resolução (%) — tickets encerrados/resolvidos / total, arredondado 1 decimal
    const queryTaxaResolucao = `
      SELECT
        ROUND(
          CAST(
            COUNT(DISTINCT id_ticket) FILTER (
              WHERE UPPER(status_ticket) IN ('ENCERRADO', 'RESOLVIDO', 'FECHADO')
            ) AS NUMERIC
          )
          / NULLIF(COUNT(DISTINCT id_ticket), 0) * 100
        , 1) AS taxa
      FROM TICKETS_EMPRESA
      WHERE id_loja = ANY($1::int[])
    `;

    // 4. Tempo médio de resolução em horas (usa data_inicio e data_encerramento)
    const queryTempoMedio = `
      SELECT
        ROUND(
          CAST(
            AVG(EXTRACT(EPOCH FROM (data_encerramento - data_inicio)) / 3600.0)
          AS NUMERIC)
        , 1) AS media_horas
      FROM TICKETS_EMPRESA
      WHERE id_loja = ANY($1::int[])
        AND data_encerramento IS NOT NULL
        AND data_inicio IS NOT NULL
        AND UPPER(status_ticket) IN ('ENCERRADO', 'RESOLVIDO', 'FECHADO')
    `;

    // 5. Distribuicao por status (grafico donut)
    const queryPorStatus = `
      SELECT
        LOWER(status_ticket) AS status,
        COUNT(*) AS total
      FROM TICKETS_EMPRESA
      WHERE id_loja = ANY($1::int[])
      GROUP BY LOWER(status_ticket)
      ORDER BY total DESC
    `;

    // 6. Distribuicao por prioridade (grafico radar)
    const queryPorPrioridade = `
      SELECT
        LOWER(COALESCE(prioridade, 'media')) AS prioridade,
        COUNT(*) AS total
      FROM TICKETS_EMPRESA
      WHERE id_loja = ANY($1::int[])
      GROUP BY LOWER(COALESCE(prioridade, 'media'))
      ORDER BY prioridade
    `;

    // 7. Tickets por mes — ultimos 6 meses (grafico de linha)
    const queryPorMes = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', data_inicio), 'Mon/YY') AS mes,
        DATE_TRUNC('month', data_inicio) AS mes_dt,
        COUNT(*) AS total
      FROM TICKETS_EMPRESA
      WHERE id_loja = ANY($1::int[])
        AND data_inicio >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', data_inicio)
      ORDER BY mes_dt ASC
    `;

    // Executa todas as queries em paralelo
    const [
      resClientes,
      resAbertos,
      resTaxa,
      resTempo,
      resStatus,
      resPrioridade,
      resMes
    ] = await Promise.all([
      pool.query(queryTotalClientes),
      pool.query(queryChamadosAbertos, [idsLojas]),
      pool.query(queryTaxaResolucao, [idsLojas]),
      pool.query(queryTempoMedio, [idsLojas]),
      pool.query(queryPorStatus, [idsLojas]),
      pool.query(queryPorPrioridade, [idsLojas]),
      pool.query(queryPorMes, [idsLojas])
    ]);

    const totalClientes   = parseInt(resClientes.rows[0]?.total || 0);
    const chamadosAbertos = parseInt(resAbertos.rows[0]?.total || 0);
    const taxaResolucao   = parseFloat(resTaxa.rows[0]?.taxa || 0);
    const tempoMedioHoras = parseFloat(resTempo.rows[0]?.media_horas || 0);

    // Formata tempo: < 24h → "Xh", senão → "X.Xd"
    let tempoMedioFormatado;
    if (!tempoMedioHoras || tempoMedioHoras === 0) {
      tempoMedioFormatado = '-';
    } else if (tempoMedioHoras < 24) {
      tempoMedioFormatado = `${tempoMedioHoras}h`;
    } else {
      tempoMedioFormatado = `${(tempoMedioHoras / 24).toFixed(1)}d`;
    }

    res.status(200).json({
      totalClientes,
      chamadosAbertos,
      taxaResolucao,
      tempoMedioFormatado,
      graficos: {
        porStatus:     resStatus.rows,      // [{ status, total }]
        porPrioridade: resPrioridade.rows,  // [{ prioridade, total }]
        porMes:        resMes.rows          // [{ mes, total }]
      }
    });

  } catch (erro) {
    console.error('[getEstatisticas]', erro);
    res.status(500).json({ mensagem: 'Erro ao carregar KPIs.' });
  }
};
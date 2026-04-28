const pool = require('../../dbConfig');


exports.getHomePageData = async (req, res) => {
  const idsLojas = JSON.parse(req.query.ids_lojas || '[]');
  if (!idsLojas.length) return res.status(400).json({ mensagem: "Nenhuma loja encontrada" });

  try {
    const queryChamados = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            WHERE id_loja = ANY($1::int[])
         )
       `;

    const queryChamadosResolvidos = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            where status_ticket = 'RESOLVIDO'
            and id_loja = ANY($1::int[])
         )
       `;

    const queryChamadosEmAndamento = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            WHERE STATUS_TICKET = 'EM_ANDAMENTO'
            and id_loja = ANY($1::int[])
         )
       `;

    const queryChamadosAbertos = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            where status_ticket = 'ABERTO'
            and id_loja = ANY($1::int[])
         )
       `;

    const resultTotalChamados = await pool.query(queryChamados, [idsLojas]);
    const totalChamadosObj = resultTotalChamados.rows[0];
    const totalChamados = Object.values(totalChamadosObj)[0];

    const resultChamadosAbertos = await pool.query(queryChamadosAbertos, [idsLojas]);
    const chamadosAbertosObj = resultChamadosAbertos.rows[0];
    const chamadosAbertos = Object.values(chamadosAbertosObj)[0];

    const resultChamadosResolvidos = await pool.query(queryChamadosResolvidos, [idsLojas]);
    const chamadosResolvidosObj = resultChamadosResolvidos.rows[0];
    const chamadosResolvidos = Object.values(chamadosResolvidosObj)[0];

    const resultChamadosEmAndamento = await pool.query(queryChamadosEmAndamento, [idsLojas]);
    const chamadosEmAndamentoObj = resultChamadosEmAndamento.rows[0];
    const chamadosEmAndamento = Object.values(chamadosEmAndamentoObj)[0];

    res.status(200).json({
      totalChamados,
      chamadosResolvidos,
      chamadosEmAndamento,
      chamadosAbertos
    })


  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao carregar KPIs' });
  }
};

exports.getHomePageRecentes = async (req, res) => {
  const idsLojas = JSON.parse(req.query.ids_lojas || '[]');
  if (!idsLojas.length) return res.status(400).json({ mensagem: 'Nenhuma loja encontrada.' });

  try {

    const queryChamadosRecentes = `
      SELECT
        id_ticket,
        assunto,
        nome_completo,
        LOWER(status_ticket) AS status,
        LOWER(COALESCE(prioridade, 'media')) AS prioridade,
        data_inicio
      FROM tickets_empresa a
      INNER JOIN clientes_empresa b ON a.id_cliente_empresa = b.id_cliente_empresa
      WHERE a.id_loja = ANY($1::int[])
      ORDER BY data_inicio DESC
      LIMIT 4
    `

    const resultChamadosRecentes = await pool.query(queryChamadosRecentes, [idsLojas]);
    const chamados = resultChamadosRecentes.rows;

    res.status(200).json(chamados)

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao recuperar dados da API' })
  }
};
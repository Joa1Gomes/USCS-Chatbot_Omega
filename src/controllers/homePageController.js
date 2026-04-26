const pool = require('../../dbConfig');


exports.getHomePageData = async (req, res) => {
  try {
    const queryChamados = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
         )
       `;

    const queryChamadosResolvidos = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            where status_ticket = 'RESOLVIDO'
         )
       `;

    const queryChamadosEmAndamento = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            WHERE STATUS_TICKET = 'EM_ANDAMENTO'
         )
       `;

    const queryChamadosAbertos = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            where status_ticket = 'ABERTO'
         )
       `;

    const resultTotalChamados = await pool.query(queryChamados);
    const totalChamadosObj = resultTotalChamados.rows[0];
    const totalChamados = Object.values(totalChamadosObj)[0];

    const resultChamadosAbertos = await pool.query(queryChamadosAbertos);
    const chamadosAbertosObj = resultChamadosAbertos.rows[0];
    const chamadosAbertos = Object.values(chamadosAbertosObj)[0];

    const resultChamadosResolvidos = await pool.query(queryChamadosResolvidos);
    const chamadosResolvidosObj = resultChamadosResolvidos.rows[0];
    const chamadosResolvidos = Object.values(chamadosResolvidosObj)[0];

    const resultChamadosEmAndamento = await pool.query(queryChamadosEmAndamento);
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
      ORDER BY data_inicio DESC
      LIMIT 4
    `

    const resultChamadosRecentes = await pool.query(queryChamadosRecentes);
    const chamados = resultChamadosRecentes.rows;

    res.status(200).json(chamados)

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao recuperar dados da API' })
  }
};
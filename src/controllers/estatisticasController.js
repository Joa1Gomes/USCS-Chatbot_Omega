const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');

exports.getEstatisticas = async (req, res) => {
  const idsLojas = JSON.parse(req.query.ids_lojas || '[]');
  if (!idsLojas.length) return res.status(400).json({ mensagem: 'Nenhuma loja encontrada' })

  try {


    // Defidindo as consultas que vou utiilizar
    const queryTotalClientes = `
          SELECT COUNT(distinct id_cliente_empresa)
          FROM CLIENTES_EMPRESA

        `;

    const queryChamadosAbertos = `
          (
            Select count(distinct id_ticket)
            from TICKETS_EMPRESA
            where status_ticket = 'ABERTO'
            and id_loja = ANY($1::int[])
         )
       `;

    const queryTaxaResolucao = `
          (
            Select (CAST((select count(distinct id_ticket) from TICKETS_EMPRESA where status_ticket = 'ENCERRADO') AS FLOAT)
                     / count(distinct id_ticket)) * 100
            from TICKETS_EMPRESA
            WHERE id_loja = ANY($1::int[])
         )
       `;

    const queryMediaTempoResposta = `
          (
            Select AVG(tempo_resposta)
            from TICKETS_EMPRESA
            where status_ticket = 'ENCERRADO'
         )
       `;

    const resultTotalClientes = await pool.query(queryTotalClientes)
    const totalClientesObj = resultTotalClientes.rows[0];
    const totalClientes = Object.values(totalClientesObj)[0];


    const resultChamadosAbertos = await pool.query(queryChamadosAbertos, [idsLojas])
    const chamadosAbertosObj = resultChamadosAbertos.rows[0];
    const chamadosAbertos = Object.values(chamadosAbertosObj)[0];


    const resultTaxaResolucao = await pool.query(queryTaxaResolucao, [idsLojas])
    const taxaResolucaoObj = resultTaxaResolucao.rows[0];
    const taxaResolucao = Object.values(taxaResolucaoObj)[0];


    res.status(200).json({
      totalClientes
      , chamadosAbertos
      , taxaResolucao
    })

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao carregar KPIs.' });
  }
};
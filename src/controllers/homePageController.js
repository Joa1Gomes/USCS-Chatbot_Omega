const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');

exports.getHomePageData = async (req, res) => {
    try {

        const queryTotalTickets = `

          SELECT COUNT(DISTINCT id_ticket)
          FROM TICKETS_EMPRESA

        `;

        const resultTotalTickets = await pool.query(queryTotalTickets);
        const totalTicketsObj = resultTotalTickets.rows[0];
        const totalTickets = Object.values(totalTicketsObj)[0];


        const queryTicketsResolvidos = `
          SELECT COUNT(DISTINCT id_ticket)
          FROM TICKETS_EMPRESA
          WHERE status_ticket = 'ENCERRADO'

        `;

        const resultTicketsResolvidos = await pool.query(queryTicketsResolvidos);
        const ticketsResolvidosObj = resultTicketsResolvidos.rows[0];
        const ticketsResolvidos = Object.values(ticketsResolvidosObj)[0];

        const queryTicketsEmAndamento = `
          SELECT COUNT(DISTINCT ID_TICKET)
          FROM TICKETS_EMPRESA
          WHERE status_ticket IN ('ABERTO', 'EM_ANDAMENTO')

        `;

        const resultTicketsEmAndamento = await pool.query(queryTicketsEmAndamento);
        const ticketsEmAndamentoObj = resultTicketsEmAndamento.rows[0];
        const ticketsEmAndamento = Object.values(ticketsEmAndamentoObj)[0];

        const queryTempoMedio = `
            SELECT 'OI'

        `;

        const resultTempoMedio = await pool.query(queryTempoMedio);
        const tempoMedioObj = resultTempoMedio.rows[0];
        const tempoMedio = Object.values(tempoMedioObj)[0];


        res.status(200).json({
            totalTickets
            , ticketsResolvidos
            , ticketsEmAndamento
            , tempoMedio
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({ mensagem: 'Erro ao carregar dados da página inicial.' });
    }

}
const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');

exports.getEstatisticas = async (req, res) => {
  try {
    // Conexão com o banco

    // Defidindo as consultas que vou utiilizar
    const queryTotalClientes = `
          SELECT COUNT(distinct id_cliente)
          FROM clientes
        `;

    const resultTotalClientes = await pool.query(queryTotalClientes)
    const totalClientesObj = resultTotalClientes.rows[0];
    const totalClientes = Object.values(totalClientesObj)[0];

    const queryTotalVendas = `
          (
            Select count(*)
            from ATENDIMENTOS
         )
       `;

    const resultTotalVendas = await pool.query(queryTotalVendas)
    const totalVendasObj = resultTotalVendas.rows[0];
    const totalVendas = Object.values(totalVendasObj)[0];


    res.status(200).json({
      totalClientes
      , totalVendas
    })

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao carregar KPIs.' });
  }
};
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../../dbConfig');

exports.getEstatisticas = async (req, res) => {
    try {
        // Conexão com o banco
        await sql.connect(config);
        
        // Defidindo as consultas que vou utiilizar
        const queryTotalClientes = `
          SELECT COUNT(*)
          FROM USUARIO US
          LEFT JOIN ADMINISTRADOR ADM 
            ON US.ID_USUARIO = ADM.ID_ADMIN
            WHERE ID_USUARIO NOT IN 
            (
              SELECT ID_ADMIN
              FROM ADMINISTRADOR
            )
        `;
        
        const resultTotalClientes = await sql.query(queryTotalClientes)
        const totalClientesObj = resultTotalClientes.recordset[0];
        const totalClientes = Object.values(totalClientesObj)[0];

        const queryTotalVendas = `
          (
            Select count(*)
            from VENDAS
         )
       `;

        const resultTotalVendas = await sql.query(queryTotalVendas)
        const totalVendasObj = resultTotalVendas.recordset[0];
        const totalVendas = Object.values(totalVendasObj)[0];


        res.status(200).json({
            totalClientes
            ,totalVendas
          })
        
      } catch (erro) {
        console.error(erro);
                
        res.status(500).json({ mensagem: 'Erro ao carregar KPIs.'});
      } 
    };
const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');

const queryListaChamados = `
    SELECT 
        c.id_ticket,
        c.nome_cliente,
        c.assunto,
        c.descricao,
        c.status,
        c.prioridade,
        c.data_abertura,
        u.nome AS cliente
    FROM chamados c
    JOIN usuarios u ON c.usuario_id = u.id
    ORDER BY c.data_abertura DESC
`;
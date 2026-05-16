const pool = require('../../dbConfig');

// Método post para criar uma conversa atrelada a um ticket
exports.criarConversa = async (req, res) => {
    const { id_ticket } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO CONVERSAS (id_ticket) VALUES ($1) RETURNING id_conversa`,
            [id_ticket]
        );
        res.status(201).json({ id_conversa: result.rows[0].id_conversa });
    } catch (erro) {
        console.error('Erro ao criar conversa', erro);
        res.status(500).json({ mensagem: 'Erro ao criar conversa.' });
    }
};

exports.getMensagens = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id_mensagem, remetente, conteudo, data_envio
        FROM MENSAGENS
        WHERE id_conversa = $1
        ORDER BY data_envio ASC, id_mensagem ASC`,
            [id]
        );
        res.status(200).json(result.rows);
    } catch (erro) {
        console.error('Erro ao buscar mensagens:', erro);
        res.status(500).json({ mensagem: 'Erro ao buscar mensagens.' });
    }
};

exports.inserirMensagem = async (req, res) => {
    const { id } = req.params;
    const { remetente, conteudo } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO MENSAGENS (id_conversa, remetente, conteudo)
       VALUES ($1, $2, $3)
       RETURNING id_mensagem, data_envio`,
            [id, remetente, conteudo]
        );
        res.status(201).json(result.rows[0]);
    } catch (erro) {
        console.error('Erro ao inserir mensagem:', erro);
        res.status(500).json({ mensagem: 'Erro ao inserir mensagem.' });
    }
};
// GET /conversas/ticket/:id_ticket — Busca a conversa pelo id do ticket
exports.getConversaPorTicket = async (req, res) => {
    const { id_ticket } = req.params;
    try {
        const result = await pool.query(
            `SELECT id_conversa, status FROM CONVERSAS WHERE id_ticket = $1 LIMIT 1`,
            [id_ticket]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Conversa não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (erro) {
        console.error('Erro ao buscar conversa:', erro);
        res.status(500).json({ mensagem: 'Erro ao buscar conversa.' });
    }
};
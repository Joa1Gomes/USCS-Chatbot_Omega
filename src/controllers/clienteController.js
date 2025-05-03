const { sql, poolConnect, pool } = require('../database/db');

async function listarDevolucoesCliente(req, res) {
    await poolConnect;
    const { idCliente } = req.params;

    if (!idCliente) {
        return res.status(400).send('ID do cliente não informado.');
    }

    try {
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query(`
                SELECT d.idDevolucao, d.dataSolicitacao, d.status
                FROM Devolucoes d
                WHERE d.idUsuarioCliente = @idCliente
                ORDER BY d.dataSolicitacao DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao listar devoluções:', err);
        res.status(500).send('Erro interno no servidor');
    }
}

async function listarProdutos(req, res) {
    await poolConnect;

    try {
        const result = await pool.request()
            .query('SELECT idProduto, nomeProduto FROM Produtos ORDER BY nomeProduto');

        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        res.status(500).send('Erro ao buscar produtos');
    }
}

async function criarNovaDevolucao(req, res) {
    await poolConnect;
    const { idCliente, itens } = req.body;

    if (!idCliente) {
        return res.status(400).send('ID do cliente não fornecido.');
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).send('Nenhum item enviado para devolução.');
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const request = transaction.request();
        const devolucaoResult = await request
            .input('idCliente', idCliente)
            .query(`
                INSERT INTO Devolucoes (idUsuarioCliente, status)
                OUTPUT inserted.idDevolucao
                VALUES (@idCliente, 'Aguardando')
            `);

        const idDevolucao = devolucaoResult.recordset[0].idDevolucao;

        for (const item of itens) {
            await transaction.request()
                .input('idDevolucao', idDevolucao)
                .input('idProduto', item.idProduto)
                .input('quantidade', item.quantidade)
                .input('motivo', item.motivo)
                .query(`
                    INSERT INTO ItensDevolucao (idDevolucao, idProduto, quantidade, motivo)
                    VALUES (@idDevolucao, @idProduto, @quantidade, @motivo)
                `);
        }

        await transaction.commit();

        res.json({ sucesso: true, idDevolucao });
    } catch (err) {
        await transaction.rollback();
        console.error('Erro ao criar nova devolução:', err);
        res.status(500).send('Erro ao criar devolução');
    }
}

module.exports = {
    listarDevolucoesCliente,
    criarNovaDevolucao,
    listarProdutos
};
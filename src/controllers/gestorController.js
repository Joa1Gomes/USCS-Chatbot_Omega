const { poolConnect, pool } = require('../database/db');
const { enviarEmail } = require('../services/emailService');

async function listarDevolucoes(req, res) {
    await poolConnect;

    try {
        const result = await pool.request()
            .query(`
                SELECT d.idDevolucao, u.nome AS nomeCliente, u.email AS emailCliente,
                       d.dataSolicitacao, d.status
                FROM Devolucoes d
                INNER JOIN Usuarios u ON d.idUsuarioCliente = u.idUsuario
                ORDER BY d.dataSolicitacao DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao listar devoluções para gestor:', err);
        res.status(500).send('Erro interno no servidor');
    }
}

async function responderDevolucao(req, res) {
    await poolConnect;
    const { idDevolucao, idGestor, mensagemResposta } = req.body;

    try {
        await pool.request()
            .input('idDevolucao', idDevolucao)
            .input('idGestor', idGestor)
            .input('mensagemResposta', mensagemResposta)
            .query(`
                UPDATE Devolucoes
                SET 
                    idUsuarioGestor = @idGestor,
                    mensagemResposta = @mensagemResposta,
                    dataResposta = GETDATE(),
                    status = 'Respondido'
                WHERE idDevolucao = @idDevolucao
            `);

        const emailResult = await pool.request()
            .input('idDevolucao', idDevolucao)
            .query(`
                SELECT u.email, u.nome
                FROM Devolucoes d
                INNER JOIN Usuarios u ON d.idUsuarioCliente = u.idUsuario
                WHERE d.idDevolucao = @idDevolucao
            `);

        if (emailResult.recordset.length === 0) {
            return res.status(404).send('Cliente não encontrado.');
        }

        const { email, nome } = emailResult.recordset[0];

        await enviarEmail(email, `Resposta da sua devolução`, 
            `Olá ${nome},\n\n${mensagemResposta}\n\nAtenciosamente,\nEquipe Logística Reversa`
        );

        res.json({ sucesso: true, mensagem: 'Resposta enviada e e-mail disparado!' });
    } catch (err) {
        console.error('Erro ao responder devolução:', err);
        res.status(500).send('Erro ao responder devolução');
    }
}

module.exports = { listarDevolucoes, responderDevolucao };
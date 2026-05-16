const pool = require('../../dbConfig');
const bcrypt = require('bcrypt');
// GET /configuracoes/:id/info
exports.getUserInfo = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
      SELECT
        primeiro_nome_usuario,
        sobrenome_usuario,
        email_usuario
      FROM USUARIO_EMPRESA
      WHERE id_usuario = $1
    `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar informações do usuário' });
    }
};
// PUT /configuracoes/:id/nome
exports.updateNome = async (req, res) => {
    const { id } = req.params;
    const { primeiro_nome, sobrenome } = req.body;
    try {
        await pool.query(
            `UPDATE USUARIO_EMPRESA SET primeiro_nome_usuario = $1, sobrenome_usuario = $2 WHERE id_usuario = $3`,
            [primeiro_nome, sobrenome, id]
        );
        res.json({ mensagem: 'Nome atualizado com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar nome' });
    }
};
// PUT /configuracoes/:id/email
exports.updateEmail = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    try {
        // Verifica se email já existe para outro usuário
        const check = await pool.query(
            `SELECT id_usuario FROM USUARIO_EMPRESA WHERE email_usuario = $1 AND id_usuario != $2`,
            [email, id]
        );
        if (check.rows.length > 0) {
            return res.status(409).json({ mensagem: 'Este email já está em uso' });
        }
        await pool.query(
            `UPDATE USUARIO_EMPRESA SET email_usuario = $1 WHERE id_usuario = $2`,
            [email, id]
        );
        res.json({ mensagem: 'Email atualizado com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar email' });
    }
};
// PUT /configuracoes/:id/senha
exports.updateSenha = async (req, res) => {
    const { id } = req.params;
    const { senhaAtual, senhaNova } = req.body;
    try {
        // Busca o hash atual
        const result = await pool.query(
            `SELECT senha_hash FROM USUARIO_EMPRESA WHERE id_usuario = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        const valida = await bcrypt.compare(senhaAtual, result.rows[0].senha_hash);
        if (!valida) {
            return res.status(401).json({ mensagem: 'Senha atual incorreta' });
        }
        const novoHash = await bcrypt.hash(senhaNova, 10);
        await pool.query(
            `UPDATE USUARIO_EMPRESA SET senha_hash = $1 WHERE id_usuario = $2`,
            [novoHash, id]
        );
        res.json({ mensagem: 'Senha atualizada com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar senha' });
    }
};
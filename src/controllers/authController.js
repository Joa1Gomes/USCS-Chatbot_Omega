const { poolConnect, pool } = require('../database/db');

async function login(req, res) {
    await poolConnect;
    const { email, senha } = req.body;

    try {
        const result = await pool.request()
            .input('email', email)
            .input('senha', senha)
            .query('SELECT idUsuario, nome, tipoUsuario FROM Usuarios WHERE email = @email AND senha = @senha');

        if (result.recordset.length > 0) {
            res.json({
                sucesso: true,
                usuario: result.recordset[0]
            });
        } else {
            res.status(401).json({ sucesso: false, mensagem: 'Email ou senha inválidos' });
        }
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
    }
}

module.exports = { login };
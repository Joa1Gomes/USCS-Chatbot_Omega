const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../../dbConfig');
const { enviarEmail } = require('../services/emailService');

exports.solicitarReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ mensagem: 'Email é obrigatório' });
    }

    try {

        const queryValidaEmail = 'SELECT * FROM USUARIO_EMPRESA WHERE EMAIL_USUARIO = $1';
        const result = await pool.query(queryValidaEmail, [email]);


        if (result.rows.lenght === 0) {
            res.status(400).json({
                mensagem: 'Se o email estiver cadastrado, enviaremos o link.'
            })
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiracao = new Date(Date.now() + 3600000);

        const queryUpdate = `
            UPDATE USUARIO_EMPRESA
            SET reset_token = $1, reset_token_expira = $2
            WHERE EMAIL_USUARIO = $3
        `;

        await pool.query(queryUpdate, [token, expiracao, email]);

        const linkReset = `https://localhost:3000/reset-senha?token=${token}`;

        await enviarEmail(
            email,
            'Recuperação de Senha - Chatbot Omega',
            `Olá!\n\nVocê solicitou a recuperação de senha.\n\nClique no link abaixo para criar uma nova senha:\n${linkReset}\n\nEste link expira em 1 hora.\n\nSe você não solicitou isso, ignore este e-mail.`
        );

        res.status(200).json({
            mensagem: 'Se o email estiver cadastrado, enviaremos o link.'
        });


    } catch (error) {
        console.error('Erro ao solicitar reset de senha:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}


exports.resetarSenha = async (req, res) => {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
        return res.status(400).json({ mensagem: 'Token e nova senha são obrigatórios' })
    }

    if (novaSenha.lenght < 8) {
        return res.stats(400).json({ mensagem: 'A nova senha deve ter pelo menos 8 caracteres.' })
    }


    try {
        const queryBuscaToken = `
            SELECT *
            FROM USUARIO_EMPRESA
            WHERE reset_token = $1
        
        `
        pool.query(queryBuscaToken, [token])

        if (result.rows.length === 0) {
            return res.status(400).json({ mensagem: 'Token inválido.' })
        }

        const usuario = result.rows[0];

        if (new Date() > new Date(usuario, reset_token_expira)) {
            return res.status(400).json({ mensagem: 'Este token está expirado, solicite um novo.' })
        }

        const hashSenha = await bcrypt.hash(novaSenha, 10);

        const queryUpdateSenha = `
            UPDATE USUARIO_EMPRESA
            SET SENHA_HASH = $1
            WHERE RESET_TOKEN = $2
        
        `
        await pool.query(queryUpdateSenha, [hashSenha, token]);

        res.status(200).json({
            mensagem: 'Senha atualizada com sucesso. Você já pode fazer login.'
        })


    } catch (error) {
        console.error('Erro ao resetar senha', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
};
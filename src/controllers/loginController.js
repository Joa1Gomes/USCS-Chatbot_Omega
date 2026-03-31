const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../../dbConfig');

exports.LogarUsuario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Conexão com o banco
    //await sql.connect(config);

    // Defidindo a consulta que vou utiilizar
    const query = `
          SELECT * FROM USUARIO_EMPRESA WHERE email_usuario = $1
        `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
    }

    const usuario = result.rows[0]

    const validaSenha = await bcrypt.compare(senha, usuario.senha_hash);

    if (!validaSenha) {
      return res.status(401).json({ mensagem: 'Senha incorreta.' });
    }

    res.status(200).json({ mensagem: 'Login realizado com sucesso!' });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao processar login.' });
  };
}
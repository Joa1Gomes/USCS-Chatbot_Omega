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

    // buscar as lojas que o usuario tem acesso
    const queryLojas = `
    
      SELECT ul.id_loja, l.nome_loja
      FROM usuario_lojas ul
      INNER JOIN lojas l ON ul.id_loja = l.id_loja
      WHERE ul.id_usuario = $1
    
    `
    const resultLojas = await pool.query(queryLojas, [usuario.id_usuario]);
    const lojas = resultLojas.rows;

    const queryIsAdmin = `
    
      SELECT perfil
      FROM usuario_empresa
      where id_usuario = $1
    `

    const resultPerfil = await pool.query(queryIsAdmin, [usuario.id_usuario]);
    const pefilObj = resultPerfil.rows[0];
    const perfil = Object.values(pefilObj)[0];


    res.status(200).json({
      mensagem: "Login realizado com sucesos",
      id_usuario: usuario.id_usuario,
      lojas, // array com as informações das lojas
      perfil
    });


    //res.status(200).json({ mensagem: 'Login realizado com sucesso!' });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao processar login.' });
  };
};
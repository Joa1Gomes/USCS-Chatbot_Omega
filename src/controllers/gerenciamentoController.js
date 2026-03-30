const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');


const queryListaUsuarios = `
SELECT
    U.ID_USUARIO,
    CONCAT(U.PRIMEIRO_NOME_USUARIO, ' ', U.SOBRENOME_USUARIO) AS NOME_COMPLETO,
    U.EMAIL_USUARIO,
    'ADMINISTRADOR' AS PERMISSAO
FROM USUARIO_EMPRESA U
`;

exports.listarUsuarios = async (req, res) => {
  try {
    const resultListaUsuarios = await pool.query(queryListaUsuarios)
    res.json(resultListaUsuarios.rows);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao carregar Usuarios' });
  }
};

exports.atualizaPermissao = async (req, res) => {
  const idUsuario = req.params.id;
  const { novaPermissao } = req.body;

  try {

    if (novaPermissao === 'ADMINISTRADOR') {
      const queryAtualizaPraAdmin = `
         INSERT INTO ADMINISTRADOR (ID_ADMIN)
         VALUES ($1)
         ON CONFLICT (ID_ADMIN) DO NOTHING
       `;

      await pool.query(queryAtualizaPraAdmin, [idUsuario]);

    } else {
      const queryAtualizaPraUser = `
         DELETE 
         FROM ADMINISTRADOR
         WHERE ID_ADMIN = $1
       `;

      await pool.query(queryAtualizaPraUser, [idUsuario]);
    }

    const resultListaUsuarios = await pool.query(queryListaUsuarios)

    res.json(resultListaUsuarios.rows);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao carregar Usuarios' });
  }
};

exports.deletarUsuario = async (req, res) => { // Permite um id no URl da requisição
  const idUsuario = req.params.id; //Define uma variavel com o valor do ID

  try {

    const queryDeletaUsuario = `
        DELETE 
        FROM USUARIO
        WHERE ID_USUARIO = $1
    `;

    await pool.query(queryDeletaUsuario, [idUsuario]);

    const resultListaUsuarios = await pool.query(queryListaUsuarios)

    res.json(resultListaUsuarios.rows);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({ mensagem: 'Erro ao carregar Usuarios' });
  }
};
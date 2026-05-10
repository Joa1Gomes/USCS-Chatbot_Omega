const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');

// ⚠️ Remova a queryListaUsuarios global (linha 6–13) e substitua listarUsuarios por:

exports.listarUsuarios = async (req, res) => {
  const { id_empresa } = req.query;

  if (!id_empresa) {
    return res.status(400).json({ mensagem: 'id_empresa é obrigatório' });
  }

  try {
    const query = `
      SELECT
          id_usuario,
          CONCAT(primeiro_nome_usuario, ' ', sobrenome_usuario) AS nome_completo,
          email_usuario,
          UPPER(COALESCE(perfil, 'usuario')) AS permissao
      FROM usuario_empresa
      WHERE id_empresa = $1
      ORDER BY primeiro_nome_usuario
    `;
    const result = await pool.query(query, [id_empresa]);
    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao carregar Usuarios' });
  }
};


exports.atualizaPermissao = async (req, res) => {
  const idUsuario = req.params.id;
  const { novaPermissao } = req.body;

  try {
    // Atualiza o campo perfil direto na tabela usuario_empresa
    const perfilNovo = novaPermissao === 'ADMINISTRADOR' ? 'admin' : 'usuario';

    await pool.query(
      `UPDATE usuario_empresa SET perfil = $1 WHERE id_usuario = $2`,
      [perfilNovo, idUsuario]
    );

    res.json({ mensagem: 'Permissão atualizada com sucesso' });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar permissão' });
  }
};

exports.deletarUsuario = async (req, res) => {
  const idUsuario = req.params.id;

  try {
    // Remove primeiro as associações de lojas (evita erro de FK)
    await pool.query(`DELETE FROM usuario_lojas WHERE id_usuario = $1`, [idUsuario]);
    await pool.query(`DELETE FROM usuario_empresa WHERE id_usuario = $1`, [idUsuario]);

    res.json({ mensagem: 'Usuário deletado com sucesso' });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao deletar usuário' });
  }
};

// GET /gerenciamento/lojas-empresa
// Retorna todas as lojas da empresa do admin logado (passa id_empresa via query)
exports.listarLojasEmpresa = async (req, res) => {
  const { id_empresa } = req.query;
  if (!id_empresa) return res.status(400).json({ mensagem: 'id_empresa é obrigatório' });

  try {
    const query = `
      SELECT id_loja, nome_loja
      FROM lojas
      WHERE id_empresa = $1
      ORDER BY nome_loja
    `;
    const result = await pool.query(query, [id_empresa]);
    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao listar lojas da empresa' });
  }
};

// GET /gerenciamento/:id/lojas
// Retorna os id_loja que o usuário já tem acesso
exports.listarLojasUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT id_loja FROM usuario_lojas WHERE id_usuario = $1`;
    const result = await pool.query(query, [id]);
    res.json(result.rows.map(r => r.id_loja));
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao buscar lojas do usuário' });
  }
};

// PUT /gerenciamento/:id/lojas
// Recebe { idsLojas: [1, 2, 3] } e substitui as lojas do usuário
exports.atualizarLojasUsuario = async (req, res) => {
  const { id } = req.params;
  const { idsLojas } = req.body; // array de ids

  try {
    // Deleta as associações antigas
    await pool.query(`DELETE FROM usuario_lojas WHERE id_usuario = $1`, [id]);

    // Insere as novas
    if (idsLojas && idsLojas.length > 0) {
      const valores = idsLojas.map((idLoja, i) => `($1, $${i + 2})`).join(', ');
      await pool.query(
        `INSERT INTO usuario_lojas (id_usuario, id_loja) VALUES ${valores}`,
        [id, ...idsLojas]
      );
    }

    res.json({ mensagem: 'Lojas atualizadas com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar lojas do usuário' });
  }
};

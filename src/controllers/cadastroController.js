const bcrypt = require('bcrypt');
//const pool = require('pg');
const pool = require('../../dbConfig');

exports.cadastrarUsuario = async (req, res) => {
  const { primeiroNome, sobrenome, email, senha, dataNascimento, telefone } = req.body;
  if (!primeiroNome || !sobrenome || !email || !senha || !dataNascimento || !telefone) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensagem: 'Email inválido.' });
  }
  try {

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query = `INSERT INTO USUARIO_EMPRESA (primeiro_nome_usuario, sobrenome_usuario, email_usuario, data_nascimento, telefone_usuario, senha_hash) VALUES ($1, $2, $3, $4, $5, $6)`;

    await pool.query(query, [primeiroNome, sobrenome, email, dataNascimento, telefone, senhaCriptografada]);

    res.status(200).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (erro) {
    console.error(erro);
    if (erro.code === '23505') {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ mensagem: 'Erro ao processar cadastro.' });
  }
};
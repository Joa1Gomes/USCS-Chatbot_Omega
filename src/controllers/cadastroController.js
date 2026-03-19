const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../../dbConfig').default;

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
    await sql.connect(config);

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query = `INSERT INTO USUARIO_EMPRESA (PRIMEIRO_NOME_USUARIO, SOBRENOME_USUARIO, EMAIL_USUARIO, DATA_NASCIMENTO, TELEFONE_USUARIO, SENHA_HASH) VALUES (@primeiroNome, @sobrenome, @email, @dataNascimento, @telefone, @senhaCriptografada)`;


    const request = new sql.Request();

    request.input('primeiroNome', sql.VarChar, primeiroNome);
    request.input('sobrenome', sql.VarChar, sobrenome);
    request.input('email', sql.VarChar, email);
    request.input('dataNascimento', sql.Date, dataNascimento);
    request.input('telefone', sql.VarChar, telefone);
    request.input('senhaCriptografada', sql.VarChar, senhaCriptografada);

    await request.query(query);

    res.status(200).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (erro) {
    console.error(erro);
    if (erro.number === 2627) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ mensagem: 'Erro ao processar cadastro.' });
  }
};
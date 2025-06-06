const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../../dbConfig').default;

exports.cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensagem: 'Email inválido.' });
  }
  try {
    await sql.connect(config);

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query = `
        INSERT INTO USUARIO
         (NOME_USUARIO,
          EMAIL_USUARIO,
          SENHA_HASH) 
        VALUES 
        (@nome, @email, @senha)`;


    const request = new sql.Request();

    request.input('nome', sql.VarChar, nome);
    request.input('email', sql.VarChar, email);
    request.input('senha', sql.VarChar, senhaCriptografada);

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
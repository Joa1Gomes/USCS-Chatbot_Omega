const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../../dbConfig').default;

exports.LogarUsuario = async (req, res) => {
    const {email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
      }
    
      try {
        // Conexão com o banco
        await sql.connect(config);
    
        // Defidindo a consulta que vou utiilizar
        const query = `
          SELECT * FROM USUARIO WHERE EMAIL_USUARIO = @email
        `;
        
        const request = new sql.Request();
        request.input('email', sql.VarChar, email);
        
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
        }

        const usuario = result.recordset[0]

        const validaSenha = await bcrypt.compare(senha, usuario.SENHA_HASH);
        
        if (!validaSenha) {
            return res.status(401).json({ mensagem: 'Senha incorreta.'});
        }

        res.status(200).json({ mensagem: 'Login realizado com sucesso!' });
        
      } catch (erro) {
        console.error(erro);
                
        res.status(500).json({ mensagem: 'Erro ao processar login.'});
      } ;
}
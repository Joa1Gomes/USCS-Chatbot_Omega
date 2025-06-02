const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../../dbConfig');


const queryListaUsuarios = `
SELECT
    U.ID_USUARIO,
    U.NOME_USUARIO,
    U.EMAIL_USUARIO,
    CASE
       WHEN EXISTS (
          SELECT 1 
          FROM ADMINISTRADOR A 
          WHERE A.ID_ADMIN = U.ID_USUARIO
        ) THEN 'ADMINISTRADOR'
        ELSE 'USUÁRIO'
    END AS PERMISSAO
FROM USUARIO U
`;

 exports.listarUsuarios = async (req, res) => {
   try {
     // Conexão com o banco
     await sql.connect(config);
     const resultListaUsuarios = await sql.query(queryListaUsuarios)
     await sql.close();
     res.json(resultListaUsuarios.recordset);              
    
   } catch (erro) {
     console.error(erro);
     await sql.close();
     res.status(500).json({ mensagem: 'Erro ao carregar Usuarios'});
   } 
 };

exports.atualizaPermissao = async (req, res) => { 
   const idUsuario = req.params.id; 
   const {novaPermissao} = req.body;
  
   try {
     await sql.connect(config);
    
     if (novaPermissao === 'ADMINISTRADOR') {
         const queryAtualizaPraAdmin = `
         IF NOT EXISTS 
         (
           SELECT 1 
           FROM ADMINISTRADOR
           WHERE ID_ADMIN  = @idUsuario
         )
         BEGIN
           INSERT INTO ADMINISTRADOR (ID_ADMIN)
           VALUES (@idUsuario)
         END
       `;
    
     const request = new sql.Request();
     request.input('idUsuario', sql.Int, idUsuario);
     await request.query(queryAtualizaPraAdmin);

     } else {
       const queryAtualizaPraUser = `
         DELETE 
         FROM ADMINISTRADOR
         WHERE ID_ADMIN = @idUsuario
       `;

       const request = new sql.Request();
       request.input('idUsuario', sql.Int, idUsuario);
       await request.query(queryAtualizaPraUser);
     }                                   

     const resultListaUsuarios = await sql.query(queryListaUsuarios)
     await sql.close();
     res.json(resultListaUsuarios.recordset);              
    
   } catch (erro) {
     console.error(erro);
     await sql.close();
     res.status(500).json({ mensagem: 'Erro ao carregar Usuarios'});
   } 
 };

 exports.deletarUsuario = async (req, res) => { // Permite um id no URl da requisição
  const idUsuario = req.params.id; //Define uma variavel com o valor do ID

  try {
    await sql.connect(config);
   
      const queryDeletaUsuario = `
        DELETE 
        FROM USUARIO
        WHERE ID_USUARIO = @idUsuario
    `;
   
    const request = new sql.Request();
    request.input('idUsuario', sql.Int, idUsuario);
    await request.query(queryDeletaUsuario);                             

    const resultListaUsuarios = await sql.query(queryListaUsuarios)
    await sql.close();
    res.json(resultListaUsuarios.recordset);              
   
  } catch (erro) {
    console.error(erro);
    await sql.close();
    res.status(500).json({ mensagem: 'Erro ao carregar Usuarios'});
  } 
};
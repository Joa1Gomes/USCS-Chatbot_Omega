const sql = require('mssql');
const config = require('../../dbConfig').default;

exports.cadastrarCliente = async (req, res) => {
  const { nomeCliente, emailCliente} = req.body;
  
  try {
    await sql.connect(config);

    const query = `
        INSERT INTO clientes
         (primeiro_nome,
          ultimo_nome,
          email_cliente)
        OUTPUT INSERTED.ID_CLIENTE
        VALUES 
        (@primeiro_nome, @ultimo_nome, @email_cliente)`;


    const request = new sql.Request();

    let partesNome = nomeCliente.split(" ");

    let primeiroNome = partesNome[0];

    let ultimoIndex = partesNome.length - 1;
    let ultimoNome = partesNome[ultimoIndex]

    request.input('primeiro_nome', sql.VarChar, primeiroNome);
    request.input('ultimo_nome', sql.VarChar, ultimoNome);
    request.input('email_cliente', sql.VarChar, emailCliente);

    
    const checkRequest = new sql.Request();
    checkRequest.input('email_cliente', sql.VarChar, emailCliente);
    const existing = await checkRequest.query('SELECT ID_CLIENTE FROM clientes WHERE email_cliente = @email_cliente');
    if (existing.recordset.length > 0) {
      return res.status(200).json({ idCliente: existing.recordset[0].ID_CLIENTE });
    }

    const result = await request.query(query);

    const idCliente = result.recordset[0].ID_CLIENTE;
    return res.status(200).json({ idCliente });
    
  } catch (erro) {
        console.error(erro);
        if (erro.number === 2627) {
        const selectRequest = new sql.Request();

        selectRequest.input('email_cliente', sql.VarChar, emailCliente);
        const selectResult = await selectRequest.query('SELECT ID_CLIENTE FROM clientes WHERE email_cliente = @email_cliente');

        if (selectResult.recordset.length > 0) {
          return res.status(200).json({idCliente: selectResult.recordset[0].ID_CLIENTE });
        }
        }
        res.status(500).json({ mensagem: 'Erro ao processar cadastro.' });
  }
};
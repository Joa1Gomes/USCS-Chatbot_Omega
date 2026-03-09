const sql = require('mssql');
const config = require('../../dbConfig').default;

exports.encerrarAtendimento = async (req, res) => {
  const { idCliente, pedido, descricao, tipoSolicitacao } = req.body;

  try {
    await sql.connect(config);

    const query = `
        INSERT INTO atendimentos
         (id_cliente,
          tipo_atendimento,
          numero_pedido,
          descricao_atendimento,
          flag_cancelado,
          tipo_cancelamento,
          data_atendimento
          ) 
        VALUES 
        (@idCliente, @tipoSolicitacao, @pedido, @descricao, 0, '', getdate())
        `;


    const request = new sql.Request();

    request.input('idCliente', sql.Int, idCliente);
    request.input('pedido', sql.NVarChar, pedido);
    request.input('descricao', sql.NVarChar, descricao);
    request.input('tipoSolicitacao', sql.NVarChar, tipoSolicitacao);

    await request.query(query);
    
    res.status(200).json({ mensagem: 'Atendimento cadastrado com sucesso!' });
  } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao processar cadastro.' });
  }
};
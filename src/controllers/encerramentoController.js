const pool = require('../../dbConfig');

exports.encerrarAtendimento = async (req, res) => {
  const { idCliente, pedido, descricao, tipoSolicitacao } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO TICKETS_EMPRESA
         (id_cliente_empresa, assunto, descricao, prioridade, status_ticket, data_inicio)
       VALUES ($1, $2, $3, 'media', 'ABERTO', NOW())
       RETURNING id_ticket`,
      [idCliente, tipoSolicitacao, descricao || pedido]
    );

    const id_ticket = result.rows[0].id_ticket;
    res.status(200).json({ mensagem: 'Atendimento registrado!', id_ticket });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao processar cadastro.' });
  }
};

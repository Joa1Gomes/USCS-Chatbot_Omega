const pool = require('../../dbConfig');

exports.cadastrarCliente = async (req, res) => {
  const { nomeCliente, emailCliente } = req.body;

  try {
    // Separa primeiro e último nome
    const partesNome = nomeCliente ? nomeCliente.trim().split(' ') : [''];
    const primeiroNome = partesNome[0];
    const ultimoNome = partesNome.length > 1 ? partesNome[partesNome.length - 1] : '';

    // Se o cliente já existe pelo e-mail, retorna o id existente
    const existing = await pool.query(
      `SELECT id_cliente_empresa FROM clientes_empresa WHERE email_cliente = $1 LIMIT 1`,
      [emailCliente]
    );

    if (existing.rowCount > 0) {
      return res.status(200).json({ idCliente: existing.rows[0].id_cliente_empresa });
    }

    // Insere novo cliente e retorna o id gerado
    const result = await pool.query(
      `INSERT INTO clientes_empresa (nome_completo, email_cliente)
       VALUES ($1, $2)
       RETURNING id_cliente_empresa`,
      [`${primeiroNome} ${ultimoNome}`.trim(), emailCliente]
    );

    const idCliente = result.rows[0].id_cliente_empresa;
    return res.status(201).json({ idCliente });

  } catch (erro) {
    console.error('Erro ao cadastrar cliente:', erro);

    // Violação de unique (email duplicado) — retorna o cliente já existente
    if (erro.code === '23505') {
      try {
        const fallback = await pool.query(
          `SELECT id_cliente_empresa FROM clientes_empresa WHERE email_cliente = $1 LIMIT 1`,
          [emailCliente]
        );
        if (fallback.rowCount > 0) {
          return res.status(200).json({ idCliente: fallback.rows[0].id_cliente_empresa });
        }
      } catch (err2) {
        console.error('Erro no fallback:', err2);
      }
    }

    res.status(500).json({ mensagem: 'Erro ao processar cadastro.' });
  }
};
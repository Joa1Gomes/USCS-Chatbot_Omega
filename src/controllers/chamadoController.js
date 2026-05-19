const pool = require('../../dbConfig');

//GET /chamados - Vai listar todos os chamados 
exports.getChamados = async (req, res) => {

    const idsLojas = JSON.parse(req.query.ids_lojas || '[]');

    if (!idsLojas.length) {
        return res.status(400).json({ mensagem: "Nenhuma loja encontrada" });
    }

    try {
        const query = ` 
        SELECT 
            id_ticket
            ,a.id_loja
            ,l.nome_loja
            ,COALESCE(assunto, 'Sem título') as titulo
            ,COALESCE(descricao, 'Sem descrição') as descricao
            ,COALESCE(nome_completo, 'Sem Nome') as nome_cliente
            ,data_inicio as data
            ,LOWER(COALESCE(prioridade, 'media')) as prioridade
            ,LOWER(status_ticket) as status
        from TICKETS_EMPRESA a
		inner join clientes_empresa b on a.id_cliente_empresa = b.id_cliente_empresa
        inner join lojas l on l.id_loja = a.id_loja
        where a.id_loja = ANY($1::int[])
        ORDER BY data_inicio DESC
            `;

        const result = await pool.query(query, [idsLojas]);

        const chamados = result.rows;

        res.status(200).json(chamados);

    } catch (erro) {
        console.error('Erro ao buscar chamados: ', erro);
        res.status(500).json({ mensagem: 'Erro ao carregar chamados.' });
    }
};

// PATCH /chamados/:id - atualiza o status, prioridade
//e descrição de um chamado

exports.updateChamado = async (req, res) => {
    const { id } = req.params;
    const { status, prioridade, descricao } = req.body;

    try {
        const query = `
        UPDATE TICKETS_EMPRESA
        SET status_ticket = UPPER($1),
            prioridade = LOWER($2),
            descricao = $3
        WHERE id_ticket = $4
        RETURNING ID_TICKET
        `

        const result = await pool.query(query, [status, prioridade, descricao, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Chamado não encontrado' });
        }

        res.status(200).json({ mensagem: 'Chamado atualizado com sucesso!' });

    } catch (erro) {
        console.error('Erro ao atualizar o chamado:', erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar chamado.' });
    }
};

// PATCH /chamado/:id - fechar um chamado (ENCERRAR)

exports.fecharChamado = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
        UPDATE TICKETS_EMPRESA
        SET status_ticket = 'ENCERRADO',
            data_encerramento = now()::timestamp(0)
        WHERE id_ticket = $1
        RETURNING id_ticket
        `;

        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Chamado não encontrado' });
        }

        res.status(200).json({ mensagem: 'Chamado encerrado com sucesso' })

    } catch (erro) {
        console.error('Erro ao encerrar chamado', erro);
        res.status(500).json({ mensagem: 'Erro ao encerrar o chamado' });
    }
};

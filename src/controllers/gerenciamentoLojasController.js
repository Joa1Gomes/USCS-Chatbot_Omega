const pool = require('../../dbConfig');

exports.getLojas = async (req, res) => {
    const { id_empresa, id_usuario, is_admin } = req.query;
    const isAdmin = is_admin === 'true' || is_admin === '"true"';

    console.log(`[getLojas] id_empresa=${id_empresa} | id_usuario=${id_usuario} | is_admin=${is_admin} | isAdmin=${isAdmin}`);

    try {
        let queryLojas;
        let params;

        if (isAdmin) {
            // Admin vê TODAS as lojas da empresa
            queryLojas = `
                SELECT id_loja, codigo_loja, nome_loja, cnpj_loja, cidade, estado, telefone, status
                FROM lojas
                WHERE id_empresa = $1
                ORDER BY nome_loja ASC
            `;
            params = [id_empresa];
        } else {
            // Usuário comum vê apenas as lojas vinculadas a ele na tabela usuario_lojas
            queryLojas = `
                SELECT l.id_loja, l.codigo_loja, l.nome_loja, l.cnpj_loja, l.cidade, l.estado, l.telefone, l.status
                FROM lojas l
                INNER JOIN usuario_lojas ul ON ul.id_loja = l.id_loja
                WHERE ul.id_usuario = $1
                ORDER BY l.nome_loja ASC
            `;
            params = [id_usuario];
        }

        const resultLojas = await pool.query(queryLojas, params);
        res.status(200).json(resultLojas.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao retornar as lojas' });
    }
};

exports.cadastraLojas = async (req, res) => {
    const { codigo_loja,
        nome_loja,
        cnpj_loja,
        cidade,
        estado,
        endereco,
        telefone,
        status

    } = req.body;

    const { id_empresa } = req.body;

    try {
        const queryCadastroLojas = `
            INSERT INTO lojas 
            (id_empresa, codigo_loja, nome_loja, cnpj_loja, cidade, estado, endereco, telefone, status, data_cadastro, data_atualizacao)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), null)
        `;

        const result = await pool.query(queryCadastroLojas,
            [id_empresa,
                codigo_loja,
                nome_loja,
                cnpj_loja,
                cidade,
                estado,
                endereco,
                telefone,
                status]);

        if (result.rowCount === 0) {
            return res.status(500).json({ mensagem: 'Erro ao cadastrar loja' })
        }

        res.status(200).json({ mensagem: 'Loja cadastrada com sucesso' });
    } catch (erro) {
        console.error('Erro ao cadastrar loja:', erro);
        res.status(500).json({ mensagem: 'Erro ao cadastrar a loja' });
    }
}

exports.deletaLoja = async (req, res) => {
    const { id_loja } = req.params;
    try {
        const queryDeletaLoja = `
        DELETE
        FROM LOJAS
        WHERE id_loja = $1
        `;

        const result = await pool.query(queryDeletaLoja, [id_loja]);
        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Loja não encontrada para deletar' });
        }

        return res.status(200).json({ mensagem: 'Loja deletada com sucesso' });
    } catch (erro) {
        console.error('Erro ao deletar loja:', erro);
        res.status(500).json({ mensagem: 'Erro ao deletar a loja.' });
    }
}

exports.editarLoja = async (req, res) => {
    const { id_loja } = req.params; // Pega o código da URL
    const { nome_loja, cnpj_loja, cidade, estado, endereco, telefone, status } = req.body;
    try {
        const queryUpdate = `
            UPDATE lojas 
            SET nome_loja = $1, cnpj_loja = $2, cidade = $3, estado = $4, endereco = $5, telefone = $6, status = $7, data_atualizacao = now()
            WHERE id_loja = $8
        `;

        const result = await pool.query(queryUpdate, [nome_loja, cnpj_loja, cidade, estado, endereco, telefone, status, id_loja]);
        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Loja não encontrada para edição.' });
        }
        res.status(200).json({ mensagem: 'Loja atualizada com sucesso!' });
    } catch (erro) {
        console.error('Erro ao editar loja:', erro);
        res.status(500).json({ mensagem: 'Erro ao editar a loja.' });
    }
};
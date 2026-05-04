const pool = require('../../dbConfig');

exports.getLojas = async (req, res) => {
    try {
        const queryLojas = `
        (
        SELECT 
            codigo_loja,
            nome_loja,
            cnpj_loja,
            cidade,
            estado,
            telefone,
            status
        FROM lojas
    
        )   
        `;

        const resultLojas = await pool.query(queryLojas);//, [idLojas]); // Verificar como vou trazer esses caras
        const lojas = resultLojas.rows;

        res.status(200).json(lojas);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao retornar as lojas' });
    }
};
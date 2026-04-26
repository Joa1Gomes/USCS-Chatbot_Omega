const pool = require('../../dbConfig');

exports.getUserInfo = async (req, res) => {
    try {
        queryInfoUsuario = `
            (
                SELECT 
                    primeiro_nome_usuario,
                    sobrenome_usuario,
                    email_usuario
                FROM USUARIO
        
            )
        
        `

        const resultInfoUsuario = await pool.query(queryInfoUsuario);
        const infos = resultInfoUsuario.rows;

        res.status(200).json(infos)

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar informações do usuario' })
    }
}
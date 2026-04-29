const request = require('supertest');
const app = require('../../server'); // Importa o Express app do server.js

describe('Testes de Integração - Estatísticas', () => {
    it('Deve retornar as estatísticas com status 200', async () => {
        // Faz uma requisição GET para a rota /estatisticas enviando um ids_lojas na query
        const response = await request(app).get('/estatisticas?ids_lojas=[1]');

        // Verifica se o status code da resposta é 200 (OK)
        expect(response.status).toBe(200);

        // Verifica se a resposta está no formato JSON
        expect(response.type).toMatch(/json/);

        // Opcional: Verifica se o corpo da resposta possui alguma propriedade esperada.
        // Dependendo do que a API retorna, podemos testar se é um objeto ou array:
        expect(response.body).toBeDefined();
    });

    afterAll(async () => {
        const pool = require('../../dbConfig');
        await pool.end();
    });
});

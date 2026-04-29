const request = require('supertest');
const app = require('../../server'); // Importa o Express app do server.js

describe('Testes de Integração - Chamados', () => {
    it('Deve retornar as estatísticas com status 200', async () => {

        // TESTANDO A ROTA DE CHAMADOS PARA VERIFICAR O RETORNO

        const response = await request(app).get('/chamados?ids_lojas=[1]');

        expect(response.status).toBe(200);

        // Verifica se a resposta está no formato JSON
        expect(response.type).toMatch(/json/);

        expect(response.body).toBeDefined();
    });

    afterAll(async () => {
        const pool = require('../../dbConfig');
        await pool.end();
    });
});

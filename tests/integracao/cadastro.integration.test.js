const request = require('supertest');
const app = require('../../server'); // Importa o Express app do server.js

describe('Testes de Integração - Cadastro', () => {
    it('Deve retornar erro 400 se faltarem campos obrigatórios', async () => {

        // TESTANDO A ROTA DE CADASTRO SEM ENVIAR DADOS (BODY VAZIO)

        const response = await request(app).post('/cadastro');

        expect(response.status).toBe(400);
        expect(response.body.mensagem).toBe('Todos os campos são obrigatórios.');

    });

    afterAll(async () => {
        const pool = require('../../dbConfig');
        await pool.end();
    });
});

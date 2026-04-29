const request = require('supertest');
const app = require('../../server');

describe('Testes de Integração - Gerenciamento de Senha', () => {

    it('POST /senha/esqueceu - Deve retornar erro 400 se o email não for enviado', async () => {
        // Rota de solicitar reset de senha enviando um body vazio
        const response = await request(app).post('/senha/esqueceu').send({});

        expect(response.status).toBe(400);
        expect(response.body.mensagem).toBe('Email é obrigatório');
    });

    it('POST /senha/resetar - Deve retornar erro 400 se faltarem token e nova senha', async () => {
        // Rota de resetar senha enviando um body vazio
        const response = await request(app).post('/senha/resetar').send({});

        expect(response.status).toBe(400);
        expect(response.body.mensagem).toBe('Token e nova senha são obrigatórios');
    });

    afterAll(async () => {
        const pool = require('../../dbConfig');
        await pool.end();
    });
});

const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const cadastroRoutes = require('./src/routes/cadastroRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const estatisticasRoutes = require('./src/routes/estatisticasRoutes');
const gerenciamentoRoutes = require('./src/routes/gerenciamentoRoutes');

const app = express();
const PORT = 3000;

const config = require('./dbConfig');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function testarConexao() {
  try {
    await sql.connect(config);
    console.log('Conectado ao SQL Server com sucesso!');
  } catch (err) {
    console.error('Erro ao conectar ao SQL Server:', err);
  }
}

testarConexao();

// Rotas
app.use('/cadastro', cadastroRoutes);
app.use('/login', loginRoutes);
app.use('/estatisticas', estatisticasRoutes);
app.use('/gerenciamento', gerenciamentoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Erro interno do servidor!' });
});

// Limpeza na finalização
process.on('SIGINT', () => {
  sql.close();
  process.exit();
});

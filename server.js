const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const cadastroRoutes = require('./src/routes/cadastroRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const estatisticasRoutes = require('./src/routes/estatisticasRoutes');
const gerenciamentoRoutes = require('./src/routes/gerenciamentoRoutes');
const encerramentoRoutes = require('./src/routes/encerramentoRoutes');
const clientesRoutes = require('./src/routes/clientesRoutes');
const homePageRoutes = require('./src/routes/homePageRoutes');

const app = express();
const PORT = 3000;

const pool = require('./dbConfig');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

async function testarConexao() {
  try {
    const client = await pool.connect();
    console.log('Conectado ao Server com sucesso!');
    client.release();
  } catch (err) {
    console.error('Erro ao conectar ao Server:', err);
  }
}

testarConexao();

// Rotas
app.use('/cadastro', cadastroRoutes);
app.use('/login', loginRoutes);
app.use('/estatisticas', estatisticasRoutes);
app.use('/gerenciamento', gerenciamentoRoutes);
app.use('/encerramento', encerramentoRoutes);
app.use('/clientes', clientesRoutes);
app.use('/home', homePageRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Erro interno do servidor!' });
});

// Limpeza na finalização
process.on('SIGINT', () => {
  pool.end();
  process.exit();
});

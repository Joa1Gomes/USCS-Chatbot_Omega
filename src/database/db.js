const sql = require('mssql');

const dbConfig = {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('Erro no pool de conexão', err);
});

module.exports = {
    sql, poolConnect, pool
};
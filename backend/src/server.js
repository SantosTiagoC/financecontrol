// Importa a aplicação Express configurada
const app = require('./app');

// Define a porta. Usa a variável de ambiente PORT ou 3001 como padrão.
const port = process.env.PORT || 3001;

// Inicia o servidor
app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta ${port}`);
    console.log(`🚀 Teste de conexão: http://localhost:${port}/api/test-db`);
});
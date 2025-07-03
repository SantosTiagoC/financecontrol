// ARQUIVO COMPLETO: /src/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// Protege todas as rotas com autenticação
router.use(authMiddleware);

// Listar transações (com filtros e paginação)
router.get('/', transactionController.getAllTransactions);

// Criar nova transação (despesa ou receita)
router.post('/', transactionController.createTransaction);

module.exports = router;

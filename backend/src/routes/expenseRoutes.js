const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplica o middleware de autenticação a TODAS as rotas deste arquivo.
router.use(authMiddleware);

// Rotas para a raiz (/api/expenses)
router.route('/')
    .get(expenseController.getExpenses)
    .post(expenseController.addExpense);

// Rotas para um ID específico (/api/expenses/:id)
// O erro estava em uma das duas linhas abaixo
router.route('/:id')
    .put(expenseController.updateExpense)
    .delete(expenseController.deleteExpense);

module.exports = router;
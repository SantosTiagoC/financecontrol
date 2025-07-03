const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplica o middleware de autenticação a todas as rotas de receita
router.use(authMiddleware);

// Rotas para a raiz (/api/incomes)
router.route('/')
    .get(incomeController.getIncomes)
    .post(incomeController.addIncome);

// Rotas para um ID específico (/api/incomes/:id)
router.route('/:id')
    .put(incomeController.updateIncome)
    .delete(incomeController.deleteIncome);

module.exports = router;
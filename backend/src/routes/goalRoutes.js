const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');

// O authMiddleware continua para todas as rotas
router.use(authMiddleware);

router.route('/')
    .get(goalController.getGoals)
    .post(goalController.createGoal); // <-- Rota de criação agora não tem o premiumMiddleware aqui

router.post('/:id/contribute', goalController.addContribution);

router.route('/:id')
    .put(goalController.updateGoal)
    .delete(goalController.deleteGoal);

module.exports = router;
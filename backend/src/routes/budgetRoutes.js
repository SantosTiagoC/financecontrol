const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');

router.use(authMiddleware, premiumMiddleware);

router.route('/')
    .get(budgetController.getBudgets)
    .post(budgetController.setBudget);

module.exports = router;
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rota para o resumo do dashboard
router.get('/summary', reportController.getSummary);

// Rota para o gráfico de tendência da página de relatórios
router.get('/monthly-trend', reportController.getMonthlyTrend);

module.exports = router;
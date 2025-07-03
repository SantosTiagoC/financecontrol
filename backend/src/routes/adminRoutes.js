const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);

// Rotas de Usuários
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);

// --- ROTAS NOVAS ---
// Rotas para Gerenciamento de Planos
router.get('/plan-settings', adminController.getPlanSettings);
router.put('/plan-settings/:plan_name', adminController.updatePlanSettings);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- IMPORTAR O NOVO MIDDLEWARE ---
const authMiddleware = require('../middleware/authMiddleware');

// Rota para registrar um novo usuário (Pública)
router.post('/register', authController.register);

// Rota para logar um usuário (Pública)
router.post('/login', authController.login);

router.get('/me', authMiddleware, (req, res) => {

    res.json({
        message: "Token validado com sucesso. Você está autenticado.",
        user: req.user
    });
});

module.exports = router;
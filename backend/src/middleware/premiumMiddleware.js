const premiumMiddleware = (req, res, next) => {
    // Esta verificação assume que a informação do plano do usuário
    // será adicionada ao token JWT durante o login.
    if (req.user && req.user.plan === 'premium') {
        next(); // Usuário é premium, pode prosseguir.
    } else {
        res.status(403).json({ message: 'Acesso negado. Esta é uma funcionalidade premium.' });
    }
};

module.exports = premiumMiddleware;
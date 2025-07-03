const adminMiddleware = (req, res, next) => {
    // Verificamos a 'role' que foi adicionada ao req.user pelo authMiddleware
    if (req.user && req.user.role === 'admin') {
        next(); // Se for admin, pode passar.
    } else {
        // Se não for admin, bloqueia o acesso.
        res.status(403).json({ message: 'Acesso negado. Recurso restrito a administradores.' });
    }
};

module.exports = adminMiddleware;
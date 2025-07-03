const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // MUDANÇA IMPORTANTE:
        // O token contém um objeto "user". Precisamos atribuir esse objeto interno a req.user.
        // Linha Antiga: req.user = decoded;
        req.user = decoded.user; // Linha Correta

        next();
    } catch (ex) {
        res.status(401).json({ message: 'Token inválido.' });
    }
};
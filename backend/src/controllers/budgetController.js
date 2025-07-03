const pool = require('../config/db');

// @desc    Obter orçamentos para um mês/ano específico
exports.getBudgets = async (req, res) => {
    const user_id = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: "Mês e ano são obrigatórios." });
    }

    try {
        const [budgets] = await pool.query(`
        SELECT
            c.id as category_id,
            c.name as category_name,
            b.amount as budget_amount,
            COALESCE(SUM(e.value), 0) as spent_amount
        FROM categories c
        LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = ? AND b.month = ? AND b.year = ?
        LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ? AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?
        WHERE c.user_id IS NULL OR c.user_id = ?
        GROUP BY c.id, c.name, b.amount
        ORDER BY c.name;
    `, [user_id, month, year, user_id, month, year, user_id]);

        res.json(budgets);
    } catch (error) {
        console.error("Erro ao buscar orçamentos:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

// @desc    Definir ou atualizar o orçamento para uma categoria
exports.setBudget = async (req, res) => {
    const user_id = req.user.id;
    const { category_id, amount, month, year } = req.body;

    try {
        await pool.query(`
        INSERT INTO budgets (user_id, category_id, amount, month, year)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `, [user_id, category_id, amount, month, year]);

        res.status(200).json({ message: "Orçamento salvo com sucesso." });
    } catch (error) {
        console.error("Erro ao salvar orçamento:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};
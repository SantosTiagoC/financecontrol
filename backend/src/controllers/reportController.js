const pool = require('../config/db');

// Retorna o resumo para o mês/ano atual (usado no Dashboard)
exports.getSummary = async (req, res) => {
    const user_id = req.user.id;
    const { month, year } = req.query;
    if (!month || !year) {
        return res.status(400).json({ message: 'Mês e ano são obrigatórios.' });
    }
    try {
        const [incomeResult] = await pool.query('SELECT SUM(value) as totalIncome FROM incomes WHERE user_id = ? AND MONTH(income_date) = ? AND YEAR(income_date) = ?', [user_id, month, year]);
        const totalIncome = incomeResult[0].totalIncome || 0;
        const [expenseResult] = await pool.query('SELECT SUM(value) as totalExpenses FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?', [user_id, month, year]);
        const totalExpenses = expenseResult[0].totalExpenses || 0;
        const balance = totalIncome - totalExpenses;
        const [expensesByCategory] = await pool.query(`SELECT c.name as categoryName, SUM(e.value) as total FROM expenses e JOIN categories c ON e.category_id = c.id WHERE e.user_id = ? AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ? GROUP BY c.name ORDER BY total DESC`, [user_id, month, year]);
        res.json({
            totalIncome: parseFloat(totalIncome),
            totalExpenses: parseFloat(totalExpenses),
            balance: parseFloat(balance),
            expensesByCategory,
        });
    } catch (error) {
        console.error("Erro ao gerar resumo:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// Retorna os totais de receita e despesa dos últimos 12 meses
exports.getMonthlyTrend = async (req, res) => {
    const user_id = req.user.id;
    try {
        const [trendData] = await pool.query(`
      SELECT 
        DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
        SUM(CASE WHEN t.type = 'income' THEN t.value ELSE 0 END) AS totalIncome,
        SUM(CASE WHEN t.type = 'expense' THEN t.value ELSE 0 END) AS totalExpenses
      FROM (
        SELECT value, income_date AS transaction_date, 'income' AS type FROM incomes WHERE user_id = ?
        UNION ALL
        SELECT value, expense_date AS transaction_date, 'expense' AS type FROM expenses WHERE user_id = ?
      ) AS t
      WHERE t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m')
      ORDER BY month ASC;
    `, [user_id, user_id]);

        res.json(trendData);
    } catch (error) {
        console.error("Erro ao gerar tendência mensal:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};
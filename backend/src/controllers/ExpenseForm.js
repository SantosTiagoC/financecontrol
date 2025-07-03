const pool = require('../config/db');

// @desc    Adicionar nova despesa
exports.addExpense = async (req, res) => {
    const { description, value, expense_date, category_id } = req.body;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'INSERT INTO expenses (user_id, description, value, expense_date, category_id) VALUES (?, ?, ?, ?, ?)',
            [user_id, description, value, expense_date, category_id]
        );
        res.status(201).json({ id: result.insertId, description, value, expense_date, category_id });
    } catch (error) {
        console.error("Erro ao adicionar despesa:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Atualizar uma despesa
exports.updateExpense = async (req, res) => {
    const { description, value, expense_date, category_id } = req.body;
    const expense_id = req.params.id;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'UPDATE expenses SET description = ?, value = ?, expense_date = ?, category_id = ? WHERE id = ? AND user_id = ?',
            [description, value, expense_date, category_id, expense_id, user_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Despesa não encontrada ou usuário não autorizado.' });
        }
        res.json({ message: 'Despesa atualizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar despesa:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Listar despesas do usuário com filtros
exports.getExpenses = async (req, res) => {
    const user_id = req.user.id;
    const { search, startDate, endDate } = req.query;
    let query = `
    SELECT e.*, c.name as category_name 
    FROM expenses e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.user_id = ?`;
    const params = [user_id];
    if (search) { query += ' AND e.description LIKE ?'; params.push(`%${search}%`); }
    if (startDate) { query += ' AND e.expense_date >= ?'; params.push(startDate); }
    if (endDate) { query += ' AND e.expense_date <= ?'; params.push(endDate); }
    query += ' ORDER BY e.expense_date DESC';
    try {
        const [expenses] = await pool.query(query, params);
        res.json(expenses);
    } catch (error) {
        console.error("Erro ao buscar despesas:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Deletar uma despesa
exports.deleteExpense = async (req, res) => {
    const expense_id = req.params.id;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [expense_id, user_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Despesa não encontrada ou usuário não autorizado.' });
        }
        res.status(200).json({ message: 'Despesa deletada com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar despesa:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};
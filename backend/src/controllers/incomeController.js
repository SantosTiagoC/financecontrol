const pool = require('../config/db');

exports.addIncome = async (req, res) => {
    const { description, value, income_date } = req.body;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'INSERT INTO incomes (user_id, description, value, income_date) VALUES (?, ?, ?, ?)',
            [user_id, description, value, income_date]
        );
        res.status(201).json({ id: result.insertId, description, value, income_date });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.updateIncome = async (req, res) => {
    const { description, value, income_date } = req.body;
    const income_id = req.params.id;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'UPDATE incomes SET description = ?, value = ?, income_date = ? WHERE id = ? AND user_id = ?',
            [description, value, income_date, income_id, user_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Receita não encontrada ou usuário não autorizado.' });
        }
        res.json({ message: 'Receita atualizada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.getIncomes = async (req, res) => {
    const user_id = req.user.id;
    const { search, startDate, endDate } = req.query;
    let query = 'SELECT * FROM incomes WHERE user_id = ?';
    const params = [user_id];
    if (search) { query += ' AND description LIKE ?'; params.push(`%${search}%`); }
    if (startDate) { query += ' AND income_date >= ?'; params.push(startDate); }
    if (endDate) { query += ' AND income_date <= ?'; params.push(endDate); }
    query += ' ORDER BY income_date DESC';
    try {
        const [incomes] = await pool.query(query, params);
        res.json(incomes);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.deleteIncome = async (req, res) => {
    const income_id = req.params.id;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query('DELETE FROM incomes WHERE id = ? AND user_id = ?', [income_id, user_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Receita não encontrada ou não pertence ao usuário.' });
        }
        res.status(200).json({ message: 'Receita deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};
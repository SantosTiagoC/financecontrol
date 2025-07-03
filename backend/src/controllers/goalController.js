const pool = require('../config/db');

exports.createGoal = async (req, res) => {
    const { name, target_amount, target_date } = req.body;
    const user_id = req.user.id;
    const { plan: user_plan, role: user_role } = req.user; // Pega tanto o plano quanto a função

    try {
        // MUDANÇA: A verificação agora só acontece se o plano for 'free' E a função não for 'admin'
        if (user_plan === 'free' && user_role !== 'admin') {
            const [settings] = await pool.query('SELECT max_goals FROM plan_settings WHERE plan_name = ?', ['free']);
            const limit = settings[0] ? settings[0].max_goals : 1;

            const [rows] = await pool.query('SELECT COUNT(*) as goalCount FROM goals WHERE user_id = ?', [user_id]);
            const goalCount = rows[0].goalCount;

            if (goalCount >= limit) {
                return res.status(403).json({ message: `Você atingiu o limite de ${limit} meta(s) para usuários gratuitos. Faça o upgrade para criar mais!` });
            }
        }

        // Se o usuário for 'premium', 'admin', ou 'free' dentro do limite, a criação prossegue
        const [result] = await pool.query(
            'INSERT INTO goals (user_id, name, target_amount, target_date) VALUES (?, ?, ?, ?)',
            [user_id, name, target_amount, target_date || null]
        );
        res.status(201).json({ id: result.insertId, name, target_amount, target_date });
    } catch (error) {
        console.error("Erro ao criar meta:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// As outras funções (getGoals, addContribution, etc.) continuam as mesmas
exports.getGoals = async (req, res) => {
    const user_id = req.user.id;
    try {
        const [goals] = await pool.query(
            `SELECT g.id, g.name, g.target_amount, g.target_date, COALESCE(SUM(gc.amount), 0) as current_amount
       FROM goals g
       LEFT JOIN goal_contributions gc ON g.id = gc.goal_id
       WHERE g.user_id = ?
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
            [user_id]
        );
        res.json(goals);
    } catch (error) {
        console.error("Erro ao buscar metas:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.addContribution = async (req, res) => {
    const { amount, contribution_date } = req.body;
    const { id: goal_id } = req.params;
    const user_id = req.user.id;
    try {
        const [goals] = await pool.query('SELECT id FROM goals WHERE id = ? AND user_id = ?', [goal_id, user_id]);
        if (goals.length === 0) {
            return res.status(404).json({ message: 'Meta não encontrada ou não pertence ao usuário.' });
        }
        await pool.query(
            'INSERT INTO goal_contributions (goal_id, amount, contribution_date) VALUES (?, ?, ?)',
            [goal_id, amount, contribution_date]
        );
        res.status(201).json({ message: 'Contribuição adicionada com sucesso.' });
    } catch (error) {
        console.error("Erro ao adicionar contribuição:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.updateGoal = async (req, res) => {
    const { name, target_amount, target_date } = req.body;
    const { id: goal_id } = req.params;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'UPDATE goals SET name = ?, target_amount = ?, target_date = ? WHERE id = ? AND user_id = ?',
            [name, target_amount, target_date || null, goal_id, user_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Meta não encontrada ou não pertence ao usuário.' });
        }
        res.json({ message: 'Meta atualizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar meta:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.deleteGoal = async (req, res) => {
    const { id: goal_id } = req.params;
    const user_id = req.user.id;
    try {
        await pool.query('DELETE FROM goal_contributions WHERE goal_id = ?', [goal_id]);
        const [result] = await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [goal_id, user_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Meta não encontrada ou não pertence ao usuário.' });
        }
        res.status(200).json({ message: 'Meta deletada com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar meta:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};
const pool = require('../config/db');

// @desc    Listar todos os usuários
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, plan, role, created_at FROM users ORDER BY id');
        res.json(users);
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

// @desc    Atualizar os dados de um usuário
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { plan, role } = req.body;
    if (!plan || !role) {
        return res.status(400).json({ message: "Plano e função são obrigatórios." });
    }
    try {
        const [result] = await pool.query(
            'UPDATE users SET plan = ?, role = ? WHERE id = ?',
            [plan, role, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.json({ message: `Usuário ${id} atualizado com sucesso.` });
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

// @desc    Listar todas as configurações de planos
exports.getPlanSettings = async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM plan_settings');
        res.json(settings);
    } catch (error) {
        console.error("Erro ao buscar configurações de plano:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Atualizar uma configuração de plano
exports.updatePlanSettings = async (req, res) => {
    const { plan_name } = req.params;
    const { max_goals, max_accounts } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE plan_settings SET max_goals = ?, max_accounts = ? WHERE plan_name = ?',
            [max_goals, max_accounts, plan_name]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Plano '${plan_name}' não encontrado.` });
        }
        res.json({ message: `Configurações do plano ${plan_name} atualizadas.` });
    } catch (error) {
        console.error("Erro ao atualizar configurações de plano:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};
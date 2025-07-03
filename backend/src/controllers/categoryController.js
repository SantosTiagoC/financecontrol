// ARQUIVO COMPLETO: /src/controllers/categoryController.js

const pool = require('../config/db');

// Lista as categorias padrão + as do usuário
exports.getCategories = async (req, res) => {
    const user_id = req.user.id;
    try {
        const [categories] = await pool.query(
            'SELECT id, name, user_id FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY name',
            [user_id]
        );
        res.json(categories);
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// --- FUNÇÃO NOVA ---
// Cria uma nova categoria para o usuário
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'INSERT INTO categories (user_id, name) VALUES (?, ?)',
            [user_id, name]
        );
        res.status(201).json({ id: result.insertId, name, user_id });
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// --- FUNÇÃO NOVA ---
// Atualiza uma categoria do usuário
exports.updateCategory = async (req, res) => {
    const { name } = req.body;
    const { id: category_id } = req.params;
    const user_id = req.user.id;
    try {
        const [result] = await pool.query(
            'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
            [name, category_id, user_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoria não encontrada ou não pertence ao usuário.' });
        }
        res.json({ message: 'Categoria atualizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// --- FUNÇÃO NOVA ---
// Deleta uma categoria do usuário
exports.deleteCategory = async (req, res) => {
    const { id: category_id } = req.params;
    const user_id = req.user.id;
    try {
        // Adicionar lógica para re-categorizar despesas existentes antes de deletar (opcional)
        const [result] = await pool.query(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [category_id, user_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoria não encontrada, não pertence ao usuário ou é uma categoria padrão.' });
        }
        res.status(200).json({ message: 'Categoria deletada com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};
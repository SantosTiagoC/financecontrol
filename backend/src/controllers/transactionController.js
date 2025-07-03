// ARQUIVO COMPLETO: /src/controllers/transactionController.js

const pool = require('../config/db');

// LISTAGEM COM FILTROS E PAGINAÇÃO
exports.getAllTransactions = async (req, res) => {
  const user_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { search, startDate, endDate, type } = req.query;

  const baseQuery = `
        FROM (
            SELECT id, user_id, description, value, expense_date AS date, 'expense' AS type, category_id
            FROM expenses
            UNION ALL
            SELECT id, user_id, description, value, income_date AS date, 'income' AS type, NULL AS category_id
            FROM incomes
        ) AS transactions
        WHERE user_id = ?
    `;

  const params = [user_id];
  let conditions = '';

  if (search) {
    conditions += ' AND description LIKE ?';
    params.push(`%${search}%`);
  }
  if (startDate) {
    conditions += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    conditions += ' AND date <= ?';
    params.push(endDate);
  }
  if (type === 'expense' || type === 'income') {
    conditions += ' AND type = ?';
    params.push(type);
  }

  try {
    const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${conditions}`;
    const [countResult] = await pool.query(countQuery, params);
    const totalItems = countResult[0].total;

    const fetchQuery = `
            SELECT * ${baseQuery} ${conditions}
            ORDER BY date DESC
            LIMIT ? OFFSET ?
        `;
    const [result] = await pool.query(fetchQuery, [...params, limit, offset]);

    res.json({
      data: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

// NOVA ROTA: CRIAR TRANSAÇÃO
exports.createTransaction = async (req, res) => {
  const user_id = req.user.id;
  const { description, value, date, type, category_id } = req.body;

  if (!description || !value || !date || !type) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    if (type === 'expense') {
      await pool.query(
        'INSERT INTO expenses (user_id, description, value, expense_date, category_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, description, value, date, category_id]
      );
    } else if (type === 'income') {
      await pool.query(
        'INSERT INTO incomes (user_id, description, value, income_date) VALUES (?, ?, ?, ?)',
        [user_id, description, value, date]
      );
    } else {
      return res.status(400).json({ error: 'Tipo inválido.' });
    }

    res.status(201).json({ message: 'Transação criada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar transação' });
  }
};

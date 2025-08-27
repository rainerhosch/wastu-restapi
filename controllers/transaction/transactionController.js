const pool = require("../../utils/db");

// Get all transactions by user
exports.getTransactions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM transaksi ORDER BY id_transaksi DESC LIMIT 10",
            // [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM transaksi WHERE id_transaksi = ?", [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
    try {
        const { amount, description } = req.body;
        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const [result] = await pool.query(
            "INSERT INTO transaksi (user_id, amount, description, status) VALUES (?, ?, ?, ?)",
            [req.user.id, amount, description || null, "pending"]
        );

        res.status(201).json({
            id: result.insertId,
            user_id: req.user.id,
            amount,
            description,
            status: "pending",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update transaction status
exports.updateTransaction = async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await pool.query(
            "UPDATE transaksi SET status = ? WHERE id_transaksi = ? AND user_id = ?",
            [status, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ id: req.params.id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM transaksi WHERE id_transaksi = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

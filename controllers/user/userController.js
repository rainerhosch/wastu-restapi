const pool = require("../../utils/db");

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id_user, nama_user, ttd, role FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user by ID
exports.getUser = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id_user, nama_user, ttd, role FROM users WHERE id_user = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create user
exports.createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const [result] = await pool.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
        res.status(201).json({ id: result.insertId, name, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const [result] = await pool.query("UPDATE users SET name=?, email=? WHERE id=?", [name, email, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.json({ id: req.params.id, name, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

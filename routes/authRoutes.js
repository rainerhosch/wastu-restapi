const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../utils/db");
const crypto = require("crypto");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // hash password dengan md5
        const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

        const [result] = await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        res.status(201).json({ id: result.insertId, name, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login

// /**
//  * @swagger
//  * /api/auth/login:
//  *   post:
//  *     summary: Login user dan dapatkan JWT token
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 example: user@example.com
//  *               password:
//  *                 type: string
//  *                 example: yourpassword
//  *     responses:
//  *       200:
//  *         description: Berhasil login, token dikembalikan
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 token:
//  *                   type: string
//  *       400:
//  *         description: Email atau password salah
//  *       404:
//  *         description: User tidak ditemukan
//  *       500:
//  *         description: Error server
//  */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // hash password dengan md5
        const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

        // Perbaiki query: gunakan email, bukan username
        const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
            email,
        ]);
        if (rows.length === 0)
            return res.status(404).json({ message: "User not found" });

        const user = rows[0];

        // cek password
        if (user.password !== hashedPassword)
            return res.status(400).json({ message: "Invalid username or password" });

        const secret = process.env.JWT_SECRET || "secretkey";
        const token = jwt.sign(
            { id: user.id, email: user.email },
            secret,
            { expiresIn: "1h" } // token berlaku 1 jam
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

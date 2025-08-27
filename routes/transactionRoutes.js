const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction/transactionController");

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: API transaksi user
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Ambil semua transaksi milik user login
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List transaksi
 */
router.get("/", transactionController.getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Ambil transaksi berdasarkan ID
 *     tags: [Transactions]
 */
router.get("/:id", transactionController.getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Buat transaksi baru
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 */
router.post("/", transactionController.createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update status transaksi
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed]
 *     responses:
 *       200:
 *         description: Transaksi berhasil diupdate
 */
router.put("/:id", transactionController.updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Hapus transaksi
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus
 */
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;

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
 * /api/transactions/next-id:
 *   get:
 *     summary: Generate transaction ID
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Generate transaction ID
 */
router.get("/next-id", transactionController.nextTransactionId);

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
 *               semester:
 *                 type: string
 *                 example: 20251
 *               nim:
 *                 type: string
 *                 example: 141351069
 *               transaksi_ke:
 *                 type: integer
 *               rekening_trf:
 *                 type: integer
 *                 example: 1
 *               detail_transaksi:
 *                 type: array
 *                 description: Daftar detail transaksi
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_transaksi:
 *                       type: string
 *                       example: "2025080001"
 *                     id_jenis_pembayaran:
 *                       type: integer
 *                       example: 2
 *                     jml_bayar:
 *                       type: number
 *                       example: 1500000
 *                     potongan:
 *                       type: number
 *                       example: 0
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

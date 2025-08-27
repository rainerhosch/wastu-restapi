const express = require("express");
const router = express.Router();
const userController = require("../controllers/user/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API untuk manajemen user
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ambil user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID user
 *     responses:
 *       200:
 *         description: User object
 */
router.get("/:id", userController.getUser);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tambah user baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 */
router.post("/", userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User berhasil diupdate
 */
router.put("/:id", userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hapus user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 */
router.delete("/:id", userController.deleteUser);

module.exports = router;

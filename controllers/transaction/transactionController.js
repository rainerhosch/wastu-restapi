const pool = require("../../utils/db");


// ===== helper function (tidak pakai req/res) =====
async function generateTransactionIdHelper() {
    const now = new Date();
    const year = now.getFullYear().toString();       // 2025
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 08
    const idPrefix = year + month; // 202508

    // Ambil transaksi terakhir
    const [rows] = await pool.query(
        "SELECT id_transaksi FROM transaksi ORDER BY id_transaksi DESC LIMIT 1"
    );

    if (rows.length === 0) {
        // Kalau belum ada transaksi sama sekali
        res.json({ next_id: idPrefix + "0001" });
    }

    const lastId = rows[0].id_transaksi; // contoh: 2025080098
    const lastIdStr = String(lastId); // Ensure lastId is a string
    const lastIdPrefix = lastIdStr.substring(0, 6);     // 202508
    const lastNumber = parseInt(lastIdStr.substring(6)); // 0098 -> 98

    if (lastIdPrefix !== idPrefix) {
        // Kalau bulan berbeda → reset ke 0001
        return idPrefix + "0001";
    } else {
        // Kalau bulan sama → increment
        const newNumber = (lastNumber + 1).toString().padStart(4, "0");
        return idPrefix + newNumber;
    }
}

// Generate transaction ID
exports.nextTransactionId = async (req, res) => {
    // Ambil tanggal sekarang
    const now = new Date();
    const year = now.getFullYear().toString();       // 2025
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 08
    const idPrefix = year + month; // 202508
    try {
        const nextId = await generateTransactionIdHelper();
        res.json({ next_id: nextId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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
    const conn = await pool.getConnection();
    const conn_dewa = await pool_dewa.getConnection();
    try {
        const { semester, nim, transaksi_ke, rekening_trf, detail_transaksi } = req.body;
        // if (!amount) {
        //     return res.status(400).json({ message: "Amount is required" });
        // }

        // Menggunakan zona waktu Jakarta (Asia/Jakarta)
        const now = new Date();
        const jakartaDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const tanggal = jakartaDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const jam = jakartaDate.toTimeString().split(" ")[0];   // HH:MM:SS

        const id_transaksi = await generateTransactionIdHelper();

        await conn.beginTransaction();
        await conn_dewa.beginTransaction();
        // insert ke transaksi (header)
        const queryTx = `
        INSERT INTO transaksi 
        (id_transaksi, tanggal, jam, semester, nim, user_id, status_transaksi, transaksi_ke, uang_masuk, bayar_via, rekening_trf, tgl_trf, jam_trf, id_trf)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await conn.query(queryTx, [
            id_transaksi,
            tanggal,
            jam,
            semester,
            nim,
            22,
            1,
            transaksi_ke,
            1,
            3,
            rekening_trf,
            tanggal,
            jam,
            null
        ])
        await conn_dewa.query(queryTx, [
            id_transaksi,
            tanggal,
            jam,
            semester,
            nim,
            22,
            1,
            transaksi_ke,
            1,
            3,
            rekening_trf,
            tanggal,
            jam,
            null
        ])
        // const [result] = await pool.query(query, values);

        // insert ke transaksi_detail
        const queryTxDetail = `
            INSERT INTO transaksi_detail 
            (id_transaksi, id_jenis_pembayaran, jml_bayar, potongan)
            VALUES (?, ?, ?, ?)
        `;

        for (const d of detail_transaksi) {
            // contoh format detail di req.body:
            // { id_jenis_pembayaran: 4, jml_bayar: 500000, potongan: 0 }
            await conn.query(queryTxDetail, [
                id_transaksi,
                d.id_jenis_pembayaran,
                d.jml_bayar,
                d.potongan || 0
            ]);
            await conn_dewa.query(queryTxDetail, [
                id_transaksi,
                d.id_jenis_pembayaran,
                d.jml_bayar,
                d.potongan || 0
            ]);
        }
        await conn.commit();
        await conn_dewa.commit();

        res.status(201).json({
            message: "Transaction created successfully",
            id_transaksi,
            detail_transaksi
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
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

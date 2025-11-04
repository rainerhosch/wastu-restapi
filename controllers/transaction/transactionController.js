const {
    generateTransactionId,
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransactionStatus,
    deleteTransaction,
} = require("../../models/transactionModel");

exports.nextTransactionId = async (req, res) => {
    try {
        const nextId = await generateTransactionId();
        res.json({ next_id: nextId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const rows = await getAllTransactions();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const rows = await getTransactionById(req.params.id);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const { semester, nim, transaksi_ke, rekening_trf, detail_transaksi } = req.body;

        const now = new Date();
        const jakartaDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const tanggal = jakartaDate.toISOString().split("T")[0];
        const jam = jakartaDate.toTimeString().split(" ")[0];

        const id_transaksi = await generateTransactionId();

        const header = {
            id_transaksi,
            tanggal,
            jam,
            semester,
            nim,
            user_id: req.user?.id || 22,
            status_transaksi: 1,
            transaksi_ke,
            uang_masuk: 1,
            bayar_via: 3,
            rekening_trf,
            tgl_trf: tanggal,
            jam_trf: jam,
            id_trf: null,
        };

        await createTransaction(header, detail_transaksi);

        res.status(201).json({
            message: "Transaction created successfully",
            id_transaksi,
            detail_transaksi,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user?.id || 22;

        const result = await updateTransactionStatus(req.params.id, userId, status);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.user?.id || 22;

        const success = await deleteTransaction(req.params.id, userId);
        if (success) {
            res.json({ message: "Transaction deleted" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const { mainDbPool, dewaDbPool } = require("../utils/db");

async function generateTransactionId() {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const idPrefix = year + month;

    const [rows] = await mainDbPool.query(
        "SELECT id_transaksi FROM transaksi ORDER BY id_transaksi DESC LIMIT 1"
    );

    if (rows.length === 0) return idPrefix + "0001";

    const lastId = rows[0].id_transaksi.toString();
    const lastPrefix = lastId.substring(0, 6);
    const lastNumber = parseInt(lastId.substring(6));

    return lastPrefix !== idPrefix
        ? idPrefix + "0001"
        : idPrefix + (lastNumber + 1).toString().padStart(4, "0");
}

async function getAllTransactions() {
    const [rows] = await mainDbPool.query(
        "SELECT * FROM transaksi ORDER BY id_transaksi DESC LIMIT 10"
    );
    return rows;
}

async function getTransactionById(id) {
    const [rows] = await mainDbPool.query(
        "SELECT * FROM transaksi WHERE id_transaksi = ?",
        [id]
    );
    return rows;
}

async function createTransaction(header, details) {
    const conn = await mainDbPool.getConnection();
    const connDewa = await dewaDbPool.getConnection();

    try {
        await conn.beginTransaction();
        await connDewa.beginTransaction();

        const queryHeader = `
      INSERT INTO transaksi 
      (id_transaksi, tanggal, jam, semester, nim, user_id, status_transaksi, transaksi_ke, uang_masuk, bayar_via, rekening_trf, tgl_trf, jam_trf, id_trf)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const headerValues = [
            header.id_transaksi,
            header.tanggal,
            header.jam,
            header.semester,
            header.nim,
            header.user_id,
            header.status_transaksi,
            header.transaksi_ke,
            header.uang_masuk,
            header.bayar_via,
            header.rekening_trf,
            header.tgl_trf,
            header.jam_trf,
            header.id_trf,
        ];

        await conn.query(queryHeader, headerValues);
        await connDewa.query(queryHeader, headerValues);

        const queryDetail = `
      INSERT INTO transaksi_detail 
      (id_transaksi, id_jenis_pembayaran, jml_bayar, potongan)
      VALUES (?, ?, ?, ?)
    `;

        for (const d of details) {
            const values = [
                header.id_transaksi,
                d.id_jenis_pembayaran,
                d.jml_bayar,
                d.potongan || 0,
            ];
            await conn.query(queryDetail, values);
            await connDewa.query(queryDetail, values);
        }

        await conn.commit();
        await connDewa.commit();
        return header.id_transaksi;
    } catch (err) {
        await conn.rollback();
        await connDewa.rollback();
        throw err;
    } finally {
        conn.release();
        connDewa.release();
    }
}

// Update status transaksi di dua DB
async function updateTransactionStatus(id_transaksi, user_id, status) {
    const conn = await mainDbPool.getConnection();
    const connDewa = await dewaDbPool.getConnection();

    try {
        await conn.beginTransaction();
        await connDewa.beginTransaction();

        const query = "UPDATE transaksi SET status_transaksi = ? WHERE id_transaksi = ? AND user_id = ?";
        const values = [status, id_transaksi, user_id];

        const [resultMain] = await conn.query(query, values);
        const [resultDewa] = await connDewa.query(query, values);

        if (resultMain.affectedRows === 0 || resultDewa.affectedRows === 0) {
            throw new Error("Transaction not found or not updated in one of the databases");
        }

        await conn.commit();
        await connDewa.commit();
        return { id_transaksi, status };
    } catch (err) {
        await conn.rollback();
        await connDewa.rollback();
        throw err;
    } finally {
        conn.release();
        connDewa.release();
    }
}

// Delete transaksi di dua DB
async function deleteTransaction(id_transaksi, user_id) {
    const conn = await mainDbPool.getConnection();
    const connDewa = await dewaDbPool.getConnection();

    try {
        await conn.beginTransaction();
        await connDewa.beginTransaction();

        const query = "DELETE FROM transaksi WHERE id_transaksi = ? AND user_id = ?";
        const values = [id_transaksi, user_id];

        const [resultMain] = await conn.query(query, values);
        const [resultDewa] = await connDewa.query(query, values);

        if (resultMain.affectedRows === 0 || resultDewa.affectedRows === 0) {
            throw new Error("Transaction not found or not deleted in one of the databases");
        }

        await conn.commit();
        await connDewa.commit();
        return true;
    } catch (err) {
        await conn.rollback();
        await connDewa.rollback();
        throw err;
    } finally {
        conn.release();
        connDewa.release();
    }
}


module.exports = {
    generateTransactionId,
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransactionStatus,
    deleteTransaction,
};

const { mainDbPool, dewaDbPool } = require("../utils/db");

// GET: Semua tunggakan
async function getTunggakan() {
    const [rows] = await mainDbPool.query(
        "SELECT * FROM tunggakan ORDER BY id_tunggakan DESC LIMIT 10"
    );
    return rows;
}

// GET: Tunggakan berdasarkan NIM
async function getTunggakanMhs(nim) {
    const [rows] = await mainDbPool.query(
        "SELECT * FROM tunggakan WHERE nim = ?",
        [nim]
    );
    return rows;
}

// GET: Tunggakan berdasarkan NIM dan jenis
async function getTunggakanByNimAndJenis(nim, jenis_tunggakan) {
    const [rows] = await mainDbPool.query(
        "SELECT * FROM tunggakan WHERE nim = ? AND jenis_tunggakan = ?",
        [nim, jenis_tunggakan]
    );
    return rows;
}

// CREATE: Tunggakan ke dua DB dengan rollback
async function createTunggakan(tunggakan) {
    const conn = await mainDbPool.getConnection();
    const connDewa = await dewaDbPool.getConnection();

    try {
        await conn.beginTransaction();
        await connDewa.beginTransaction();

        const query = `
      INSERT INTO tunggakan (id_tunggakan, nim, jenis_tunggakan, jumlah_tunggakan)
      VALUES (?, ?, ?, ?)
    `;
        const values = [
            tunggakan.id_tunggakan,
            tunggakan.nim,
            tunggakan.jenis_tunggakan,
            tunggakan.jumlah_tunggakan,
        ];

        await conn.query(query, values);
        await connDewa.query(query, values);

        await conn.commit();
        await connDewa.commit();
        return { success: true };
    } catch (err) {
        await conn.rollback();
        await connDewa.rollback();
        throw err;
    } finally {
        conn.release();
        connDewa.release();
    }
}

// UPDATE: Tunggakan ke dua DB dengan rollback
async function updateTunggakan(id, tunggakan) {
    const conn = await mainDbPool.getConnection();
    const connDewa = await dewaDbPool.getConnection();

    try {
        await conn.beginTransaction();
        await connDewa.beginTransaction();

        const query = `
      UPDATE tunggakan
      SET nim = ?, jenis_tunggakan = ?, jumlah_tunggakan = ?
      WHERE id_tunggakan = ?
    `;
        const values = [
            tunggakan.nim,
            tunggakan.jenis_tunggakan,
            tunggakan.jumlah_tunggakan,
            id,
        ];

        const [resultMain] = await conn.query(query, values);
        const [resultDewa] = await connDewa.query(query, values);

        if (resultMain.affectedRows === 0 || resultDewa.affectedRows === 0) {
            throw new Error("Tunggakan tidak ditemukan atau gagal di salah satu DB");
        }

        await conn.commit();
        await connDewa.commit();
        return { success: true };
    } catch (err) {
        await conn.rollback();
        await connDewa.rollback();
        throw err;
    } finally {
        conn.release();
        connDewa.release();
    }
}

// DELETE: Tunggakan berdasarkan NIM dan jenis
async function deleteTunggakanByNimAndJenis(nim, jenis_tunggakan, conn, connDewa) {
    const query = "DELETE FROM tunggakan WHERE nim = ? AND jenis_tunggakan = ?";
    const values = [nim, jenis_tunggakan];

    const [resMain] = await conn.query(query, values);
    const [resDewa] = await connDewa.query(query, values);

    return resMain.affectedRows + resDewa.affectedRows;
}

// DELETE: Tunggakan ke dua DB dengan rollback
async function deleteTunggakan(id) {
    const conn = await mainDbPool.getConnection();
    const connDewa = await dewaDbPool.getConnection();

    try {
        await conn.beginTransaction();
        await connDewa.beginTransaction();

        const query = "DELETE FROM tunggakan WHERE id_tunggakan = ?";
        const values = [id];

        const [resultMain] = await conn.query(query, values);
        const [resultDewa] = await connDewa.query(query, values);

        if (resultMain.affectedRows === 0 || resultDewa.affectedRows === 0) {
            throw new Error("Tunggakan tidak ditemukan atau gagal di salah satu DB");
        }

        await conn.commit();
        await connDewa.commit();
        return { success: true };
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
    getTunggakan,
    getTunggakanMhs,
    getTunggakanByNimAndJenis,
    deleteTunggakanByNimAndJenis,
    createTunggakan,
    updateTunggakan,
    deleteTunggakan,
};
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});
const pool_dewa = mysql.createPool({
    host: process.env.DB_HOST_DEWA,
    port: process.env.DB_PORT_DEWA || 3306,
    user: process.env.DB_USER_DEWA,
    password: process.env.DB_PASS_DEWA,
    database: process.env.DB_NAME_DEWA,
});

module.exports = { pool, pool_dewa };

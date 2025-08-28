import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DATABASE,
    password: process.env.DBPASSWORD,
    port: Number(process.env.DBPORT)
});

export default pool;

// const query = async (text, params) => {
//   try {
//     const result = await pool.query(text, params);
//     return result;
//   } catch (err) {
//     console.error("DB Error:", err.message);
//     throw err;
//   }
// };

// module.exports = { query };
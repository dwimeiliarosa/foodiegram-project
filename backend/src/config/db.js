const { Pool } = require('pg');
require('dotenv').config();

// Inisialisasi Pool koneksi
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Log koneksi berhasil
pool.on('connect', () => {
  console.log('✅ Terhubung ke database PostgreSQL');
});

// Log jika ada error mendadak pada client yang idle
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // kita ekspor pool juga kalau butuh fitur lain nanti
};
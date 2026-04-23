const pool = require('../config/db');
const argon2 = require('argon2');

const seedUsers = async () => {
  try {
    const hashedPassword = await argon2.hash('123456');
    // Kita masukkan Admin Dwi
await pool.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        username = EXCLUDED.username
    `, ['admin_dwi', 'admindwi@gmail.com', hashedPassword, 'admin']);
    
    console.log("✅ User Admin berhasil di-seed dengan Argon2!");
  } catch (err) {
    console.error("❌ Gagal seed Users:", err.message);
  }
};

module.exports = seedUsers;
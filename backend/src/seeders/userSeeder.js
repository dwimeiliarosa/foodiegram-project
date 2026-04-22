const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    // Kita masukkan Admin Dwi
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['admin_dwi', 'admindwi@gmail.com', hashedPassword, 'admin']);
    
    console.log("✅ User Admin berhasil di-seed!");
  } catch (err) {
    console.error("❌ Gagal seed Users:", err.message);
  }
};

module.exports = seedUsers;
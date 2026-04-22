const pool = require('../config/db');

const seedFollows = async () => {
  try {
    // Kita asumsikan ada dua user, atau user mem-follow dirinya sendiri/admin lain
    const users = await pool.query("SELECT id FROM users LIMIT 2");
    if (users.rows.length >= 1) {
        const adminId = users.rows[0].id;
        // Simulasi: Admin memfollow seseorang (atau akun bot jika ada)
        await pool.query(`
          INSERT INTO follows (follower_id, following_id)
          VALUES ($1, $1) ON CONFLICT DO NOTHING
        `, [adminId]);
        console.log("✅ Data Follows berhasil di-seed!");
    }
  } catch (err) {
    console.error("❌ Gagal seed Follows:", err.message);
  }
};

module.exports = seedFollows;
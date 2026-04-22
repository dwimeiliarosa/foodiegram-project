const pool = require('../config/db');

const seedSaves = async () => {
  try {
    const user = await pool.query("SELECT id FROM users LIMIT 1");
    const recipe = await pool.query("SELECT id FROM recipes LIMIT 1");

    if (user.rows.length > 0 && recipe.rows.length > 0) {
      await pool.query(`
        INSERT INTO saves (user_id, recipe_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [user.rows[0].id, recipe.rows[0].id]);
      console.log("✅ Data Saves berhasil di-seed!");
    }
  } catch (err) {
    console.error("❌ Gagal seed Saves:", err.message);
  }
};

module.exports = seedSaves;
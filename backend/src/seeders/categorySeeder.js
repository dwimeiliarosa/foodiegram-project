const pool = require('../config/db');

const seedCategories = async () => {
  try {
    const categories = ['Dessert', 'Main Course', 'Drink', 'Seafood'];
    for (const cat of categories) {
      await pool.query(`
        INSERT INTO categories (name) VALUES ($1)
        ON CONFLICT DO NOTHING
      `, [cat]);
    }
    console.log("✅ Kategori berhasil di-seed!");
  } catch (err) {
    console.error("❌ Gagal seed Categories:", err.message);
  }
};

module.exports = seedCategories;
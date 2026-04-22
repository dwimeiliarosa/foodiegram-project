const pool = require('../config/db');

const seedRecipes = async () => {
  try {
    // Ambil ID admin dan ID kategori Dessert
    const userRes = await pool.query("SELECT id FROM users WHERE email = 'admindwi@gmail.com' LIMIT 1");
    const catRes = await pool.query("SELECT id FROM categories WHERE name = 'Dessert' LIMIT 1");

    if (userRes.rows.length > 0 && catRes.rows.length > 0) {
      const adminId = userRes.rows[0].id;
      const categoryId = catRes.rows[0].id;

      await pool.query(`
        INSERT INTO recipes (user_id, category_id, title, ingredients, status, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [
        adminId, 
        categoryId, 
        'Macaron Almond', 
        ['macaron', 'sugar', 'almond flour'], 
        'approved', 
        'https://storage.com/macaron.jpg'
      ]);
      console.log("✅ Resep Dummy berhasil di-seed!");
    }
  } catch (err) {
    console.error("❌ Gagal seed Recipes:", err.message);
  }
};

module.exports = seedRecipes;
const seedUsers = require('./userSeeder');
const seedCategories = require('./categorySeeder');
const seedRecipes = require('./recipeSeeder');
const seedLikes = require('./likeSeeder');
const seedSaves = require('./saveSeeder');
const seedFollows = require('./followSeeder');

const runAll = async () => {
  console.log("🚀 Menjalankan Full Seeding (6 Tabel) untuk FoodieGram...");
  
  try {
    await seedCategories(); 
    await seedUsers();      
    await seedRecipes();    // Butuh user & category
    await seedLikes();      // Butuh user & recipe
    await seedSaves();      // Butuh user & recipe
    await seedFollows();    // Butuh user
    
    console.log("🏁 MANTAP! Semua 6 tabel sudah terisi data dummy.");
  } catch (error) {
    console.error("❌ Ada error saat seeding:", error);
  } finally {
    process.exit();
  }
};

runAll();
const express = require('express');
const router = express.Router();

const { 
    getRecipeFeed,
    getFollowingFeed,
    getTrendingRecipes,
    createRecipe, 
    getAllRecipes, 
    toggleLike, 
    toggleSave,
    toggleFollow,
    getRecipeById,
    getMyRecipes,
    searchByIngredients,
    getUserStats,
    deleteRecipe,
    updateRecipe,
    getFollowers,
    getUserRecipes,
    getFollowing,
    getSavedRecipes,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getPendingRecipes, 
    verifyRecipe
} = require('../controllers/recipeController');

const authenticateToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { upload, uploadAndResize } = require('../middleware/uploadMiddleware');

 /**
 * @swagger
 * tags:
 *   - name: Recipe Discovery
 *     description: Fitur jelajah resep (Feed, Search, Detail)
 *   - name: Category Management
 *     description: Fitur kelola kategori resep (Admin)
 *   - name: Recipe Management
 *     description: Fitur kelola resep pribadi (Post, Edit, Delete, My Recipes)
 *   - name: Recipe Interactions
 *     description: Fitur interaksi user (Like, Save, Stats)
 *   - name: Social
 *     description: Fitur hubungan antar pengguna (Follow)
 *   - name: Admin Section
 *     description: Fitur khusus moderator/admin untuk verifikasi konten resep
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Mendapatkan semua resep dengan filter
 *     tags: [Recipe Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID Kategori
 *       - in: query
 *         name: max_time
 *         schema:
 *           type: integer
 *         description: Filter waktu masak maksimal
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Cari resep berdasarkan judul
 *     responses:
 *       200:
 *         description: Berhasil mengambil data resep
 */
router.get('/', authenticateToken, getAllRecipes);

/**
 * @swagger
 * /api/recipes/feed:
 *   get:
 *     summary: Endpoint khusus Infinite Scroll Feed Utama
 *     tags: [Recipe Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Berhasil mengambil feed
 */
router.get('/feed', authenticateToken, getRecipeFeed);

/**
 * @swagger
 * /api/recipes/following-feed:
 *   get:
 *     summary: Mendapatkan resep terbaru khusus dari orang yang diikuti (Social Feed)
 *     tags: [Recipe Discovery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil feed following
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/following-feed', authenticateToken, getFollowingFeed);

/**
 * @swagger
 * /api/recipes/my-recipes:
 *   get:
 *     summary: Mendapatkan semua resep yang di-upload oleh user login
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil koleksi resep sendiri
 */
router.get('/my-recipes', authenticateToken, getMyRecipes);

/**
 * @swagger
 * /api/recipes/user/{userId}:
 *   get:
 *     summary: Mendapatkan koleksi resep milik user tertentu (Profil Publik)
 *     tags: [Recipe Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil resep user
 */
router.get('/user/:userId', authenticateToken, getUserRecipes);

/**
 * @swagger
 * /api/recipes/saved:
 *   get:
 *     summary: Mendapatkan daftar resep yang disimpan oleh user login (Koleksi Bookmark)
 *     tags: [Recipe Interactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil koleksi simpanan
 */
router.get('/saved', authenticateToken, getSavedRecipes);



/**
 * @swagger
 * /api/recipes/categories:
 *   get:
 *     summary: Mendapatkan daftar semua kategori resep
 *     tags: [Category Management]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar kategori
 */
router.get('/categories', getCategories); 

/**
 * @swagger
 * /api/recipes/categories:
 *   post:
 *     summary: Menambah kategori baru (Admin Only)
 *     tags: [Category Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Traditional"
 *     responses:
 *       201:
 *         description: Berhasil dibuat
 *       403:
 *         description: Akses ditolak, bukan admin
 */
router.post('/categories', authenticateToken, adminOnly, createCategory); 

/**
 * @swagger
 * /api/recipes/categories/{id}:
 *   put:
 *     summary: Mengubah nama kategori (Admin Only)
 *     tags: [Category Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Traditional Food"
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *       403:
 *         description: Akses ditolak
 */
router.put('/categories/:id', authenticateToken, adminOnly, updateCategory); 

/**
 * @swagger
 * /api/recipes/categories/{id}:
 *   delete:
 *     summary: Menghapus kategori (Admin Only)
 *     tags: [Category Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil dihapus
 *       403:
 *         description: Akses ditolak
 */
router.delete('/categories/:id', authenticateToken, adminOnly, deleteCategory);

/**
 * @swagger
 * /api/recipes/stats:
 *   get:
 *     summary: Mendapatkan statistik performa resep user (Total Post, Views, Likes)
 *     tags: [Recipe Interactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data statistik
 */
router.get('/stats', authenticateToken, getUserStats);

/**
 * @swagger
 * /api/recipes/search-ingredients:
 *   get:
 *     summary: Cari resep berdasarkan bahan yang ada di kulkas
 *     tags: [Recipe Discovery]
 *     parameters:
 *       - in: query
 *         name: items
 *         required: true
 *         schema:
 *           type: string
 *         description: "Daftar bahan dipisahkan koma"
 *     responses:
 *       200:
 *         description: Berhasil menemukan resep yang cocok
 */
router.get('/search-ingredients', searchByIngredients);

/**
 * @swagger
 * /api/recipes/trending:
 *   get:
 *     summary: Mendapatkan 5 resep terpopuler untuk grafik dashboard (Visualisasi Data)
 *     tags: [Recipe Discovery]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data trending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   title: { type: string }
 *                   views_count: { type: integer }
 *                   protein: { type: number }
 *                   carbs: { type: number }
 *                   fat: { type: number }
 */
router.get('/trending', getTrendingRecipes);

/**
 * @swagger
 * /api/recipes/followers:
 *   get:
 *     summary: Mendapatkan daftar user yang mengikuti saya
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar followers
 */
router.get('/followers', authenticateToken, getFollowers);

/**
 * @swagger
 * /api/recipes/following:
 *   get:
 *     summary: Mendapatkan daftar user yang saya ikuti
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar following
 */
router.get('/following', authenticateToken, getFollowing);


/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Posting resep baru ke FoodieGram (Gambar atau Video)
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, category_id, ingredients, steps]
 *             properties:
 *               title: { type: string, example: "Salmon Grill Sehat" }
 *               category_id: { type: integer, example: 2 }
 *               post_type: { type: string, enum: [photo, reels], example: "photo" }
 *               ingredients: { type: string, example: "Salmon, Lemon, Rosemary, Garam" }
 *               steps: { type: string, example: "1. Cuci salmon, 2. Marinasai, 3. Panggang 15 menit" }
 *               cooking_time: { type: integer, example: 20 }
 *               protein: { type: number, example: 25.5 }
 *               carbs: { type: number, example: 5.0 }
 *               fat: { type: number, example: 12.2 }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Resep Berhasil Dipublish
 */
router.post('/', authenticateToken, upload.single('image'), uploadAndResize, createRecipe);

/**
 * @swagger
 * /api/recipes/like:
 *   post:
 *     summary: Like atau Unlike resep (Toggle)
 *     tags: [Recipe Interactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Like/Unlike berhasil
 */
router.post('/like', authenticateToken, toggleLike);

/**
 * @swagger
 * /api/recipes/save:
 *   post:
 *     summary: Simpan atau Hapus resep dari koleksi (Toggle)
 *     tags: [Recipe Interactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Berhasil disimpan/dihapus
 */
router.post('/save', authenticateToken, toggleSave);

/**
 * @swagger
 * /api/recipes/follow:
 *   post:
 *     summary: Follow atau Unfollow user lain (Toggle)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               following_id: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Berhasil Follow/Unfollow
 */
router.post('/follow', authenticateToken, toggleFollow);


/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Mendapatkan detail resep berdasarkan ID (dan tambah Views)
 *     tags: [Recipe Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail resep
 */
router.get('/:id', authenticateToken, getRecipeById);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Memperbarui data resep (Edit Judul, Bahan, dsb)
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Salmon Grill Sehat (Updated)" }
 *               category_id: { type: integer, example: 2 }
 *               ingredients: { type: string, example: "Salmon, Lemon, Rosemary" }
 *               steps: { type: string, example: "1. Cuci, 2. Panggang" }
 *     responses:
 *       200:
 *         description: Resep berhasil diperbarui
 */
router.put('/:id', authenticateToken, updateRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Menghapus resep milik user
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resep berhasil dihapus
 */
router.delete('/:id', authenticateToken, deleteRecipe);

/**
 * @swagger
 * /api/recipes/admin/pending:
 *   get:
 *     summary: Mengambil antrean resep yang perlu divalidasi (Admin Only)
 *     tags: [Admin Section]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar antrean resep yang belum diverifikasi
 */
router.get('/admin/pending', authenticateToken, adminOnly, getPendingRecipes);

/**
 * @swagger
 * /api/recipes/admin/verify/{id}:
 *   patch:
 *     summary: Menyetujui atau menolak resep (Admin Only)
 *     tags: [Admin Section]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Pilih 'approved' untuk mempublikasikan atau 'rejected' untuk menolak.
 *                 example: "rejected"
 *     responses:
 *       200:
 *         description: Berhasil memperbarui status (Diterima/Ditolak)
 *       400:
 *         description: Status tidak valid (bukan approved/rejected)
 *       403:
 *         description: Akses ditolak (Bukan Admin)
 */
router.patch('/admin/verify/:id', authenticateToken, adminOnly, verifyRecipe);

module.exports = router;
const db = require('../config/db');
// 1. IMPORT VALIDASI (Tambahkan ini di paling atas)
const { recipeSchema } = require('../utils/validation');
const { minioClient } = require('../config/minio');

// --- FUNGSI 1: MEMBUAT RESEP ---
const createRecipe = async (req, res) => {
    // 2. VALIDASI DATA DULU (Sebelum proses apapun)
    // Di dalam createRecipe
const { error, value } = recipeSchema.validate(req.body);

if (error) {
    // RETURN sangat penting agar kode di bawahnya tidak dijalankan!
    return res.status(400).json({ 
        message: "Data tidak valid", 
        detail: error.details[0].message 
    });
}

    // 3. GUNAKAN 'value' HASIL VALIDASI (Agar data bersih)
    const { 
        title, 
        category_id, 
        ingredients, 
        steps, 
        cooking_time, 
        protein, 
        carbs, 
        fat,
        post_type 
    } = value; // Mengambil dari 'value' yang sudah divalidasi Joi
    
    const userId = req.user.id;

    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
        if (post_type === 'reels' || req.file.mimetype.startsWith('video/')) {
            videoUrl = req.file.url;
        } else {
            imageUrl = req.file.url;
        }
    }

    try {
        const ingredientsArray = Array.isArray(ingredients) 
            ? ingredients 
            : ingredients.split(',').map(item => item.trim());

        const query = `
            INSERT INTO recipes (
                user_id, category_id, title, post_type, image_url, video_url,
                ingredients, steps, cooking_time, protein, carbs, fat, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending') 
            RETURNING *
        `;
        
        const values = [
            userId, category_id, title, post_type || 'photo', 
            imageUrl, videoUrl, ingredientsArray, steps, 
            cooking_time || 0, protein || 0, carbs || 0, fat || 0
        ];

        const result = await db.query(query, values);

        res.status(201).json({
            message: 'Resep FoodieGram berhasil dipublish! 🥗',
            recipe: result.rows[0]
        });
    } catch (error) {
        console.error('Error saat simpan resep:', error.message);
        res.status(500).json({ message: 'Gagal mempublish resep' });
    }
};

// --- FUNGSI 2: MENGAMBIL SEMUA RESEP (Sudah Beres) ---
const getAllRecipes = async (req, res) => {
    try {
        const { category_id, max_time, title } = req.query;
        
        // GUNAKAN parseInt untuk memastikan userId adalah angka murni
        const userId = req.user?.id ? parseInt(req.user.id) : 0; 

        let query = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            EXISTS(SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $1) as is_liked,
            EXISTS(SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $1) as is_saved
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.status = 'approved'
        `;

        const params = [userId]; 
        let paramCount = 1;

        if (category_id) {
            paramCount++;
            query += ` AND r.category_id = $${paramCount}`;
            params.push(category_id);
        }

        if (max_time) {
            paramCount++;
            query += ` AND r.cooking_time <= $${paramCount}`;
            params.push(max_time);
        }

        if (title) {
            paramCount++;
            query += ` AND r.title ILIKE $${paramCount}`;
            params.push(`%${title}%`);
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        // Ini penting supaya kamu bisa lihat error aslinya di terminal VS Code
        console.error("Error di getAllRecipes:", error); 
        res.status(500).json({ message: "Server Error" });
    }
};

const searchByIngredients = async (req, res) => {
    const { items } = req.query; // Menangkap input dari URL: ?items=ayam,telur
    
    if (!items) {
        return res.status(400).json({ message: "Masukkan bahan makanan yang ingin dicari" });
    }

    // Mengubah string "ayam, telur" menjadi array ["%ayam%", "%telur%"] untuk pencarian database
    const ingredientsArray = items.split(',').map(i => `%${i.trim()}%`);

    try {
        const query = `
            SELECT r.*, c.name as category_name, u.username
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.ingredients::text ILIKE ANY($1)
            ORDER BY r.created_at DESC
        `;
        
        const result = await db.query(query, [ingredientsArray]);
        
        res.status(200).json({
            count: result.rowCount,
            recipes: result.rows
        });
    } catch (error) {
        console.error('Error Search Ingredients:', error.message);
        res.status(500).json({ message: "Gagal mencari resep berdasarkan bahan" });
    }
};

// --- FUNGSI 3: LIKE / UNLIKE RESEP (Sudah Beres) ---
const toggleLike = async (req, res) => {
    const { recipe_id } = req.body;
    const userId = req.user.id;

    try {
        const checkLike = await db.query(
            'SELECT * FROM likes WHERE user_id = $1 AND recipe_id = $2',
            [userId, recipe_id]
        );

        if (checkLike.rows.length > 0) {
            await db.query(
                'DELETE FROM likes WHERE user_id = $1 AND recipe_id = $2',
                [userId, recipe_id]
            );
            return res.status(200).json({ message: 'Unlike berhasil' });
        } else {
            await db.query(
                'INSERT INTO likes (user_id, recipe_id) VALUES ($1, $2)',
                [userId, recipe_id]
            );
            return res.status(201).json({ message: 'Like berhasil ❤️' });
        }
    } catch (error) {
        console.error('Error Toggle Like:', error.message);
        res.status(500).json({ message: 'Gagal memproses Like' });
    }
};

// --- FUNGSI 4: SAVE / UNSAVE RESEP (Sudah Beres) ---
const toggleSave = async (req, res) => {
    const { recipe_id } = req.body;
    const userId = req.user.id;

    try {
        const checkSave = await db.query(
            'SELECT * FROM saves WHERE user_id = $1 AND recipe_id = $2',
            [userId, recipe_id]
        );

        if (checkSave.rows.length > 0) {
            await db.query(
                'DELETE FROM saves WHERE user_id = $1 AND recipe_id = $2',
                [userId, recipe_id]
            );
            return res.status(200).json({ message: 'Resep berhasil dihapus dari simpanan' });
        } else {
            await db.query(
                'INSERT INTO saves (user_id, recipe_id) VALUES ($1, $2)',
                [userId, recipe_id]
            );
            return res.status(201).json({ message: 'Resep berhasil disimpan! 🔖' });
        }
    } catch (error) {
        console.error('Error Toggle Save:', error.message);
        res.status(500).json({ message: 'Gagal memproses simpan resep' });
    }
};

// --- FUNGSI 5: DETAIL RESEP & UPDATE VIEWS (Sudah Beres) ---
const getRecipeById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null; 

    try {
        await db.query(
            'UPDATE recipes SET views_count = views_count + 1 WHERE id = $1',
            [id]
        );

        const query = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count,
            EXISTS (SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $2) as is_liked,
            EXISTS (SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $2) as is_saved
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = $1
        `;
        
        const result = await db.query(query, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Resep tidak ditemukan' });
        }

        const recipe = result.rows[0];

        // RESPONSE YANG SUDAH DI-CASTING KE NUMBER
        res.status(200).json({
            ...recipe,
            // Data Nutrisi (PENTING untuk Chart.js)
            protein: parseFloat(recipe.protein) || 0,
            carbs: parseFloat(recipe.carbs) || 0,
            fat: parseFloat(recipe.fat) || 0,
            // Data Angka Lainnya
            cooking_time: parseInt(recipe.cooking_time) || 0,
            likes_count: parseInt(recipe.likes_count) || 0,
            views_count: parseInt(recipe.views_count) || 0,
            // Data Boolean
            is_liked: !!recipe.is_liked, 
            is_saved: !!recipe.is_saved 
        });
        
    } catch (error) {
        console.error('Error Get Detail Recipe:', error.message);
        res.status(500).json({ message: 'Gagal mengambil detail resep' });
    }
};

// --- FUNGSI BARU: TRENDING RECIPES (Untuk Visualisasi Data Populer) ---
const getTrendingRecipes = async (req, res) => {
    try {
        // Mengambil 5 resep dengan views terbanyak
        const query = `
            SELECT id, title, views_count, protein, carbs, fat
            FROM recipes
            ORDER BY views_count DESC
            LIMIT 5
        `;
        const result = await db.query(query);

        // Map data agar nutrisi menjadi Number
        const trending = result.rows.map(r => ({
            ...r,
            views_count: parseInt(r.views_count),
            protein: parseFloat(r.protein),
            carbs: parseFloat(r.carbs),
            fat: parseFloat(r.fat)
        }));

        res.status(200).json(trending);
    } catch (error) {
        console.error('Error Trending:', error.message);
        res.status(500).json({ message: 'Gagal mengambil data trending' });
    }
};

// --- FUNGSI 6: MENGAMBIL RESEP MILIK USER SENDIRI (Posisi Baru) ---
const getMyRecipes = async (req, res) => {
    const userId = req.user.id; // Diambil dari token login

    try {
        const query = `
            SELECT r.*, c.name as category_name 
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [userId]);

        res.status(200).json({
            total_recipes: result.rowCount,
            recipes: result.rows
        });
    } catch (error) {
        console.error('Error Get My Recipes:', error.message);
        res.status(500).json({ message: 'Gagal mengambil resep anda' });
    }
};

// --- FUNGSI 7: STATISTIK DASHBOARD USER (Baru) ---
const getUserStats = async (req, res) => {
    const userId = req.user.id; // Mengambil ID dari token login
    try {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM recipes WHERE user_id = $1) as total_posts,
                (SELECT COALESCE(SUM(views_count), 0) FROM recipes WHERE user_id = $1) as total_views,
                (SELECT COUNT(*) FROM likes l JOIN recipes r ON l.recipe_id = r.id WHERE r.user_id = $1) as total_likes,
                (SELECT COUNT(*) FROM follows WHERE following_id = $1) as total_followers,
                (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as total_following
            FROM users
            WHERE id = $1
        `;
        const result = await db.query(query, [userId]);
        
        res.status(200).json({
            total_posts: parseInt(result.rows[0].total_posts) || 0,
            total_views: parseInt(result.rows[0].total_views) || 0,
            total_likes: parseInt(result.rows[0].total_likes) || 0,
            total_followers: parseInt(result.rows[0].total_followers) || 0, 
            total_following: parseInt(result.rows[0].total_following) || 0  
        });
    } catch (error) {
        console.error('Error Get User Stats:', error.message);
        res.status(500).json({ message: "Gagal mengambil statistik profil" });
    }
};

// --- FUNGSI 8: MENGHAPUS RESEP (Baru) ---
const deleteRecipe = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // 1. Ambil data resep untuk mendapatkan nama gambarnya
        const recipeData = await db.query(
            'SELECT image_url, user_id FROM recipes WHERE id = $1',
            [id]
        );

        // Jika resep tidak ditemukan
        if (recipeData.rows.length === 0) {
            return res.status(404).json({ message: "Resep sudah tidak ada di database!" });
        }

        const recipe = recipeData.rows[0];

        // 2. Cek kepemilikan (PENTING: Gunakan return agar tidak lanjut ke bawah)
        if (parseInt(recipe.user_id) !== parseInt(userId)) {
            return res.status(403).json({ message: "Ini bukan resepmu. Tidak boleh dihapus!" });
        }

        // 3. Hapus data di Database dulu
        await db.query('DELETE FROM recipes WHERE id = $1', [id]);

        // 4. Hapus file di MinIO (Hanya jika resep punya image_url)
        if (recipe.image_url) {
            try {
                const urlParts = recipe.image_url.split('/');
                const fileUrl = recipe.image_url || recipe.video_url;

                if (fileUrl) {
                    try {
                        const fileName = fileUrl.split('/').pop(); 
                        await minioClient.removeObject('foodiegram', `recipes/${fileName}`);
                    } catch (minioErr) {
                        console.error('Gagal hapus di MinIO:', minioErr.message);
                    }
                }
            } catch (minioErr) {
                console.error('❌ MinIO Delete Error:', minioErr.message);
                // Kita tidak return error 500 di sini karena database sudah terhapus
            }
        }

        // Kirim respons sukses hanya SEKALI di akhir
        return res.status(200).json({ 
            message: "Resep dan gambarnya berhasil dihapus selamanya! 🗑️" 
        });

    } catch (error) {
        console.error('Error Hapus:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ message: "Gagal total saat mencoba menghapus" });
        }
    }
};

// --- FUNGSI 9: UPDATE RESEP ---
const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Validasi data input menggunakan schema yang sudah ada
    const { error, value } = recipeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            message: "Data tidak valid", 
            detail: error.details[0].message 
        });
    }

    const { title, category_id, ingredients, steps, cooking_time, protein, carbs, fat } = value;

    try {
        // 2. Cek kepemilikan resep
        const checkOwnership = await db.query(
            'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengedit resep ini" });
        }

        // 3. Proses ingredients (sama seperti saat create)
        const ingredientsArray = Array.isArray(ingredients) 
            ? ingredients 
            : ingredients.split(',').map(item => item.trim());

        const query = `
            UPDATE recipes 
            SET title = $1, category_id = $2, ingredients = $3, steps = $4, 
                cooking_time = $5, protein = $6, carbs = $7, fat = $8,
                updated_at = NOW()
            WHERE id = $9 AND user_id = $10
            RETURNING *
        `;
        
        const values = [
            title, category_id, ingredientsArray, steps, 
            cooking_time, protein, carbs, fat, id, userId
        ];

        const result = await db.query(query, values);

        res.status(200).json({
            message: 'Resep berhasil diperbarui! ✨',
            recipe: result.rows[0]
        });
    } catch (error) {
        console.error('Error Update Recipe:', error.message);
        res.status(500).json({ message: 'Gagal memperbarui resep' });
    }
};

// --- FUNGSI 10: FOLLOW / UNFOLLOW USER (Baru) ---
const toggleFollow = async (req, res) => {
    const { following_id } = req.body; // ID user yang mau difollow
    const follower_id = req.user.id;   // ID kamu (dari token)

    if (parseInt(following_id) === parseInt(follower_id)) {
        return res.status(400).json({ message: "Kamu tidak bisa memfollow diri sendiri" });
    }

    try {
        const checkFollow = await db.query(
            'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
            [follower_id, following_id]
        );

        if (checkFollow.rows.length > 0) {
            await db.query(
                'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
                [follower_id, following_id]
            );
            return res.status(200).json({ message: 'Unfollow berhasil' });
        } else {
            await db.query(
                'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
                [follower_id, following_id]
            );
            return res.status(201).json({ message: 'Berhasil memfollow user ini! 🤝' });
        }
    } catch (error) {
        console.error('Error Toggle Follow:', error.message);
        res.status(500).json({ message: 'Gagal memproses follow' });
    }
};

const getRecipeFeed = async (req, res) => {
    try {
        // 1. Parameter Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 2. Identifikasi User (untuk is_liked & is_saved)
        const userId = req.user && req.user.id ? parseInt(req.user.id) : 0;

        // 3. Query Ambil Data untuk Feed (Fokus ke resep terbaru)
        const dataQuery = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            EXISTS(SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $1) as is_liked,
            EXISTS(SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $1) as is_saved
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.status = 'approved'
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        // 4. Query Hitung Total Data
        const countQuery = `SELECT COUNT(*) FROM recipes`;

        // Jalankan paralel
        const [result, totalRes] = await Promise.all([
            db.query(dataQuery, [userId, limit, offset]),
            db.query(countQuery)
        ]);

        const totalItems = parseInt(totalRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        // 5. Response
        res.json({
            pagination: {
                total_items: totalItems,
                total_pages: totalPages,
                current_page: page,
                limit: limit,
                has_more: page < totalPages
            },
            data: result.rows
        });
    } catch (error) {
        console.error("Error di getRecipeFeed:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getFollowingFeed = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT r.*, u.username, u.photo_profile, c.name as category_name,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            EXISTS(SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $1) as is_liked,
            EXISTS(SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $1) as is_saved
            FROM recipes r
            JOIN follows f ON r.user_id = f.following_id
            JOIN users u ON r.user_id = u.id
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE f.follower_id = $1 AND r.status = 'approved'
            ORDER BY r.created_at DESC
        `;
        
        const result = await db.query(query, [userId]);

        res.status(200).json({
            message: "Feed dari orang yang kamu ikuti",
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        console.error('Error Following Feed:', error.message);
        res.status(500).json({ message: "Gagal mengambil feed mengikuti" });
    }
};

// --- FUNGSI 11: DAFTAR FOLLOWERS & FOLLOWING (UPDATE SESUAI TABEL) ---
const getFollowers = async (req, res) => {
    try {
        const userId = req.user.id;
        // Query: u.full_name dihapus karena tidak ada di tabel users kamu
        const query = `
            SELECT u.id, u.username, u.photo_profile
            FROM users u
            JOIN follows f ON u.id = f.follower_id
            WHERE f.following_id = $1
        `;
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Followers:', error.message);
        res.status(500).json({ message: "Gagal mengambil daftar followers" });
    }
};

const getFollowing = async (req, res) => {
    try {
        const userId = req.user.id;
        // Query: u.full_name dihapus dan ganti ke u.photo_profile
        const query = `
            SELECT u.id, u.username, u.photo_profile
            FROM users u
            JOIN follows f ON u.id = f.following_id
            WHERE f.follower_id = $1
        `;
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Following:', error.message);
        res.status(500).json({ message: "Gagal mengambil daftar following" });
    }
};

// --- FUNGSI 12: MENGAMBIL RESEP MILIK USER LAIN (Profil Publik + Status Follow) ---
const getUserRecipes = async (req, res) => {
    const { userId } = req.params; 
    const viewerId = req.user && req.user.id ? parseInt(req.user.id) : 0; 

    try {
        const query = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            EXISTS(SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $2) as is_liked,
            EXISTS(SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $2) as is_saved,
            -- Tambahan status follow untuk profil publik
            EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = $1) as is_following
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;
        
        const result = await db.query(query, [userId, viewerId]);

        res.status(200).json({
            user_id: userId,
            is_following: result.rows.length > 0 ? result.rows[0].is_following : false,
            total_recipes: result.rowCount,
            recipes: result.rows
        });
    } catch (error) {
        console.error('Error Get User Recipes:', error.message);
        res.status(500).json({ message: 'Gagal mengambil resep user tersebut' });
    }
};

// --- FUNGSI 13: MENGAMBIL KOLEKSI RESEP YANG DISIMPAN (Bookmark) ---
const getSavedRecipes = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            TRUE as is_saved -- Karena ini diambil dari tabel saves, pasti true
            FROM saves s
            JOIN recipes r ON s.recipe_id = r.id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE s.user_id = $1
            ORDER BY s.id DESC
        `;
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Saved Recipes:', error.message);
        res.status(500).json({ message: 'Gagal mengambil koleksi simpanan' });
    }
};

// --- FUNGSI CRUD KATEGORI (Baru) ---

const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json({
            message: 'Kategori berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await db.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
        res.json({
            message: 'Kategori berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
        res.json({ message: 'Kategori berhasil dihapus' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ 
                message: 'Gagal menghapus! Kategori ini masih digunakan oleh beberapa resep.' 
            });
        }
        res.status(500).json({ error: err.message });
    }
};

// --- FUNGSI 14: MENGAMBIL DAFTAR KATEGORI (Master Data) ---
const getCategories = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM categories ORDER BY name ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Categories:', error.message);
        res.status(500).json({ message: "Gagal mengambil kategori" });
    }
};

const getPendingRecipes = async (req, res) => {
    try {
        const query = `
            SELECT r.*, u.username 
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.status = 'pending'
            ORDER BY r.created_at ASC
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil antrean resep" });
    }
};

const verifyRecipe = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Isinya: 'approved' atau 'rejected'

    // 1. Validasi Input: Pastikan status hanya approved atau rejected
    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            message: "Status tidak valid! Gunakan 'approved' atau 'rejected'." 
        });
    }

    try {
        // 2. Update status di database
        const query = "UPDATE recipes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *";
        const result = await db.query(query, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resep tidak ditemukan" });
        }

        // 3. Pesan custom agar Admin tahu apakah resep diterima atau ditolak
        const successMessage = status === 'approved' 
            ? "Resep telah disetujui dan sekarang tampil di feed publik. ✅" 
            : "Resep telah ditolak dan tidak akan muncul di feed publik. ❌";

        res.status(200).json({ 
            message: successMessage, 
            recipe: result.rows[0] 
        });
    } catch (error) {
        console.error('Error Validasi Admin:', error.message);
        res.status(500).json({ message: "Gagal memproses validasi resep" });
    }
};


module.exports = { 
    createRecipe, 
    getAllRecipes,
    getRecipeFeed,
    getFollowingFeed,
    getTrendingRecipes,
    searchByIngredients,
    toggleLike,
    toggleSave,
    toggleFollow,
    getRecipeById,
    getMyRecipes,
    getUserRecipes,
    getUserStats,
    deleteRecipe ,
    updateRecipe,
    getFollowers,
    getFollowing,
    getSavedRecipes,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getPendingRecipes, 
    verifyRecipe
};
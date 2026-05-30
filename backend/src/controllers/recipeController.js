const db = require('../config/db');
// 1. IMPORT VALIDASI (Tambahkan ini di paling atas)
const { recipeSchema } = require('../utils/validation');
const { minioClient } = require('../config/minio');

// --- FUNGSI 1: MEMBUAT RESEP ---
// --- FUNGSI 1: MEMBUAT RESEP ---
const createRecipe = async (req, res) => {
    // 2. VALIDASI DATA DULU
    const { error, value } = recipeSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ 
            message: "Data tidak valid", 
            detail: error.details[0].message 
        });
    }

    const { 
        title, category_id, ingredients, steps, 
        cooking_time, protein, carbs, fat, post_type 
    } = value;
    
    const userId = req.user.id;
    const username = req.user.username; // Pastikan middleware auth menyertakan username

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

        // 1. Simpan Resep Baru
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
        const newRecipe = result.rows[0];

        // 2. LOGIKA BARU: NOTIFIKASI KE ADMIN
        // Cari semua user yang memiliki role admin (asumsi ada kolom role di tabel users kamu)
        const adminQuery = `SELECT id FROM users WHERE role = 'admin'`;
        const admins = await db.query(adminQuery);

        if (admins.rows.length > 0) {
            // Siapkan pesan notifikasi
            const adminMessage = `Resep baru: "${title}" oleh @${username} menunggu validasi.`;
            
            // Masukkan notifikasi untuk setiap admin yang ditemukan
            const notifPromises = admins.rows.map(admin => {
                return db.query(
                    `INSERT INTO notifications (user_id, recipe_id, message) VALUES ($1, $2, $3)`,
                    [admin.id, newRecipe.id, adminMessage]
                );
            });
            
            await Promise.all(notifPromises);
        }

        res.status(201).json({
            message: 'Resep FoodieGram berhasil dipublish! Menunggu validasi admin. 🥗',
            recipe: newRecipe
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
    const username = req.user.username; // Ambil username pengirim like

    if (!recipe_id) {
        return res.status(400).json({ message: "Recipe ID wajib disertakan" });
    }

    try {
        // Cek dulu apakah resep yang mau di-like benar-barang ada di database
        const recipeCheck = await db.query('SELECT id, title, user_id FROM recipes WHERE id = $1', [recipe_id]);
        if (recipeCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Resep tidak ditemukan' });
        }

        const checkLike = await db.query(
            'SELECT * FROM likes WHERE user_id = $1 AND recipe_id = $2',
            [userId, recipe_id]
        );

        if (checkLike.rows.length > 0) {
            // Logika UNLIKE
            await db.query('DELETE FROM likes WHERE user_id = $1 AND recipe_id = $2', [userId, recipe_id]);
            
            return res.status(200).json({ 
                message: 'Unlike berhasil 💔',
                is_liked: false 
            });
        } else {
            // Logika LIKE
            await db.query('INSERT INTO likes (user_id, recipe_id) VALUES ($1, $2)', [userId, recipe_id]);

            // LOGIKA NOTIFIKASI: Beri tahu pemilik resep
            const ownerId = recipeCheck.rows[0].user_id;
            const recipeTitle = recipeCheck.rows[0].title;

            // Jangan beri notif jika yang menyukai adalah pemiliknya sendiri
            if (ownerId !== userId) {
                const message = `@${username} menyukai resep kamu: "${recipeTitle}" ❤️`;
                await db.query(
                    'INSERT INTO notifications (user_id, recipe_id, message) VALUES ($1, $2, $3)',
                    [ownerId, recipe_id, message]
                );
            }
            
            return res.status(201).json({ 
                message: 'Like berhasil ❤️',
                is_liked: true 
            });
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
    const username = req.user.username; // Pastikan middleware auth menyertakan username

    try {
        const checkSave = await db.query(
            'SELECT * FROM saves WHERE user_id = $1 AND recipe_id = $2',
            [userId, recipe_id]
        );

        if (checkSave.rows.length > 0) {
            // Logika Unsave: Hapus dari tabel saves
            await db.query(
                'DELETE FROM saves WHERE user_id = $1 AND recipe_id = $2',
                [userId, recipe_id]
            );
            return res.status(200).json({ message: 'Resep berhasil dihapus dari simpanan' });
        } else {
            // 1. Simpan Resep ke tabel saves
            await db.query(
                'INSERT INTO saves (user_id, recipe_id) VALUES ($1, $2)',
                [userId, recipe_id]
            );

            // 2. LOGIKA NOTIFIKASI: Beritahu pemilik resep
            // Ambil info pemilik resep dan judul resepnya
            const recipeInfo = await db.query(
                'SELECT user_id, title FROM recipes WHERE id = $1', 
                [recipe_id]
            );

            if (recipeInfo.rows.length > 0) {
                const ownerId = recipeInfo.rows[0].user_id;
                const recipeTitle = recipeInfo.rows[0].title;

                // Kirim notifikasi hanya jika yang menyimpan resep BUKAN pemiliknya sendiri
                if (ownerId !== userId) {
                    const message = `@${username} menyimpan resep kamu: "${recipeTitle}" 🔖`;
                    
                    await db.query(
                        'INSERT INTO notifications (user_id, recipe_id, message) VALUES ($1, $2, $3)',
                        [ownerId, recipe_id, message]
                    );
                }
            }

            return res.status(201).json({ message: 'Resep berhasil disimpan! 🔖' });
        }
    } catch (error) {
        console.error('Error Toggle Save:', error.message);
        res.status(500).json({ message: 'Gagal memproses simpan resep' });
    }
};

const getLikedRecipes = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            TRUE as is_liked,
            EXISTS(SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $1) as is_saved
            FROM likes l
            JOIN recipes r ON l.recipe_id = r.id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE l.user_id = $1
            ORDER BY l.id DESC
        `;
        const result = await db.query(query, [userId]);
        
        // OPTIMASI: Parsing tipe data numerik agar seragam dengan fungsi getRecipeById
        const parsedRecipes = result.rows.map(recipe => ({
            ...recipe,
            protein: parseFloat(recipe.protein) || 0,
            carbs: parseFloat(recipe.carbs) || 0,
            fat: parseFloat(recipe.fat) || 0,
            cooking_time: parseInt(recipe.cooking_time) || 0,
            likes_count: parseInt(recipe.likes_count) || 0,
            views_count: parseInt(recipe.views_count) || 0,
            is_liked: !!recipe.is_liked,
            is_saved: !!recipe.is_saved
        }));

        return res.status(200).json({
            total_liked: result.rowCount,
            recipes: parsedRecipes
        });
    } catch (error) {
        console.error('Error Get Liked Recipes:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil koleksi resep yang disukai' });
    }
};
const getSavedRecipes = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT r.*, c.name as category_name, u.username,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            EXISTS(SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $1) as is_liked,
            TRUE as is_saved
            FROM saves s
            JOIN recipes r ON s.recipe_id = r.id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE s.user_id = $1
            ORDER BY s.id DESC
        `;
        const result = await db.query(query, [userId]);
        
        // Parsing tipe data agar seragam dan aman di frontend
        const parsedRecipes = result.rows.map(recipe => ({
            ...recipe,
            protein: parseFloat(recipe.protein) || 0,
            carbs: parseFloat(recipe.carbs) || 0,
            fat: parseFloat(recipe.fat) || 0,
            cooking_time: parseInt(recipe.cooking_time) || 0,
            likes_count: parseInt(recipe.likes_count) || 0,
            views_count: parseInt(recipe.views_count) || 0,
            is_liked: !!recipe.is_liked,
            is_saved: !!recipe.is_saved
        }));

        return res.status(200).json({
            total_saved: result.rowCount,
            recipes: parsedRecipes
        });
    } catch (error) {
        console.error('Error Get Saved Recipes:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil koleksi resep yang disimpan' });
    }
};

// --- FUNGSI 5: DETAIL RESEP & UPDATE VIEWS ---
const getRecipeById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null; 
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // 1. LOGIKA VIEWS UNIK: Masukkan ke tabel histori
        await db.query(
            `INSERT INTO recipe_views (recipe_id, user_id, ip_address) 
             VALUES ($1, $2, $3) 
             ON CONFLICT ON CONSTRAINT unique_view DO NOTHING`,
            [id, userId, ipAddress]
        );

        // 2. Hitung total view unik
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM recipe_views WHERE recipe_id = $1`,
            [id]
        );
        const totalViews = parseInt(countResult.rows[0].total) || 0;

        // 3. Update kolom views_count di tabel recipes
        await db.query(
            `UPDATE recipes SET views_count = $1 WHERE id = $2`,
            [totalViews, id]
        );

        // 4. Ambil Detail Resep Lengkap
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

        // 5. Response dengan data yang sudah di-parsing ke tipe data yang sesuai
        return res.status(200).json({
            ...recipe,
            protein: parseFloat(recipe.protein) || 0,
            carbs: parseFloat(recipe.carbs) || 0,
            fat: parseFloat(recipe.fat) || 0,
            cooking_time: parseInt(recipe.cooking_time) || 0,
            likes_count: parseInt(recipe.likes_count) || 0,
            views_count: totalViews, 
            is_liked: !!recipe.is_liked, 
            is_saved: !!recipe.is_saved 
        });
        
    } catch (error) {
        console.error('Error Get Detail Recipe:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil detail resep' });
    }
};

// --- FUNGSI BARU: TRENDING RECIPES ---
const getTrendingRecipes = async (req, res) => {
    try {
        const query = `
            SELECT id, title, views_count, protein, carbs, fat, image_url
            FROM recipes
            WHERE status = 'approved'
            ORDER BY views_count DESC
            LIMIT 5
        `;
        const result = await db.query(query);

        const trending = result.rows.map(r => ({
            ...r,
            views_count: parseInt(r.views_count) || 0,
            protein: parseFloat(r.protein) || 0,
            carbs: parseFloat(r.carbs) || 0,
            fat: parseFloat(r.fat) || 0
        }));

        return res.status(200).json(trending);
    } catch (error) {
        console.error('Error Trending:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil data trending' });
    }
};

// --- FUNGSI 6: MENGAMBIL RESEP MILIK USER SENDIRI ---
const getMyRecipes = async (req, res) => {
    const userId = req.user.id; 

    try {
        const query = `
            SELECT r.*, c.name as category_name 
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [userId]);

        return res.status(200).json({
            total_recipes: result.rowCount,
            recipes: result.rows
        });
    } catch (error) {
        console.error('Error Get My Recipes:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil resep anda' });
    }
};

// --- FUNGSI 7: STATISTIK DASHBOARD USER ---
const getUserStats = async (req, res) => {
    const userId = req.user.id; 
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
        const stats = result.rows[0];
        
        return res.status(200).json({
            total_posts: parseInt(stats.total_posts) || 0,
            total_views: parseInt(stats.total_views) || 0,
            total_likes: parseInt(stats.total_likes) || 0,
            total_followers: parseInt(stats.total_followers) || 0, 
            total_following: parseInt(stats.total_following) || 0  
        });
    } catch (error) {
        console.error('Error Get User Stats:', error.message);
        return res.status(500).json({ message: "Gagal mengambil statistik profil" });
    }
};

// --- FUNGSI 8: MENGHAPUS RESEP ---
const deleteRecipe = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // 1. Ambil data resep untuk validasi kepemilikan dan hapus media
        const recipeData = await db.query(
            'SELECT image_url, video_url, user_id FROM recipes WHERE id = $1',
            [id]
        );

        if (recipeData.rows.length === 0) {
            return res.status(404).json({ message: "Resep sudah tidak ada di database!" });
        }

        const recipe = recipeData.rows[0];

        // 2. Cek kepemilikan
        if (parseInt(recipe.user_id) !== parseInt(userId)) {
            return res.status(403).json({ message: "Ini bukan resepmu. Tidak boleh dihapus!" });
        }

        // 3. Hapus data di Database dulu
        await db.query('DELETE FROM recipes WHERE id = $1', [id]);

        // 4. Hapus file di MinIO (Image / Video) jika ada
        const fileUrl = recipe.image_url || recipe.video_url;
        if (fileUrl) {
            try {
                const fileName = fileUrl.split('/').pop(); 
                // Memastikan objek dihapus sesuai nama file asli di folder recipes
                await minioClient.removeObject('foodiegram', `recipes/${fileName}`);
            } catch (minioErr) {
                console.error('⚠️ Gagal menghapus file di MinIO:', minioErr.message);
                // Database sudah terhapus, proses tidak dihentikan
            }
        }

        return res.status(200).json({ 
            message: "Resep dan media berhasil dihapus selamanya! 🗑️" 
        });

    } catch (error) {
        console.error('Error Hapus:', error.message);
        return res.status(500).json({ message: "Gagal total saat mencoba menghapus" });
    }
};

// --- FUNGSI 9: UPDATE RESEP ---
const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Validasi Joi Schema
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
            'SELECT 1 FROM recipes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengedit resep ini" });
        }

        // 3. Proses format ingredients array
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

        return res.status(200).json({
            message: 'Resep berhasil diperbarui! ✨',
            recipe: result.rows[0]
        });
    } catch (error) {
        console.error('Error Update Recipe:', error.message);
        return res.status(500).json({ message: 'Gagal memperbarui resep' });
    }
};

// --- FUNGSI 10: FOLLOW / UNFOLLOW USER ---
const toggleFollow = async (req, res) => {
    const { following_id } = req.body; 
    const follower_id = req.user.id;   
    const username = req.user.username; 

    if (parseInt(following_id) === parseInt(follower_id)) {
        return res.status(400).json({ message: "Kamu tidak bisa memfollow diri sendiri" });
    }

    try {
        const checkFollow = await db.query(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
            [follower_id, following_id]
        );

        if (checkFollow.rows.length > 0) {
            await db.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [follower_id, following_id]);
            return res.status(200).json({ message: 'Unfollow berhasil' });
        } else {
            await db.query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)', [follower_id, following_id]);

            // Buat Notifikasi Masuk
            const message = `@${username} mulai mengikuti kamu. 🤝`;
            await db.query(
                'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
                [following_id, message]
            );

            return res.status(201).json({ message: 'Berhasil memfollow user ini! 🤝' });
        }
    } catch (error) {
        console.error('Error Toggle Follow:', error.message);
        return res.status(500).json({ message: 'Gagal memproses follow' });
    }
};

// --- FUNGSI UTAMA: GLOBAL FEED ---
const getRecipeFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const userId = req.user && req.user.id ? parseInt(req.user.id) : 0;

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

        const countQuery = `SELECT COUNT(*) FROM recipes WHERE status = 'approved'`;

        const [result, totalRes] = await Promise.all([
            db.query(dataQuery, [userId, limit, offset]),
            db.query(countQuery)
        ]);

        const totalItems = parseInt(totalRes.rows[0].count) || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
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
        console.error("Error di getRecipeFeed:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// --- FUNGSI FEED BERDASARKAN USER YANG DIFOLLOW ---
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

        return res.status(200).json({
            message: "Feed dari orang yang kamu ikuti",
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        console.error('Error Following Feed:', error.message);
        return res.status(500).json({ message: "Gagal mengambil feed mengikuti" });
    }
};

// --- FUNGSI 11: DAFTAR FOLLOWERS ---
const getFollowers = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT u.id, u.username, u.photo_profile
            FROM users u
            JOIN follows f ON u.id = f.follower_id
            WHERE f.following_id = $1
        `;
        const result = await db.query(query, [userId]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Followers:', error.message);
        return res.status(500).json({ message: "Gagal mengambil daftar followers" });
    }
};

// --- FUNGSI 11: DAFTAR FOLLOWING ---
const getFollowing = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT u.id, u.username, u.photo_profile
            FROM users u
            JOIN follows f ON u.id = f.following_id
            WHERE f.follower_id = $1
        `;
        const result = await db.query(query, [userId]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Following:', error.message);
        return res.status(500).json({ message: "Gagal mengambil daftar following" });
    }
};

// --- FUNGSI 12: GET PROFILE USER LAIN + DATA RESEP ---
const getUserRecipes = async (req, res) => {
    const { userId } = req.params; 
    const viewerId = req.user && req.user.id ? parseInt(req.user.id) : 0; 

    try {
        const query = `
            SELECT r.*, c.name as category_name, u.username, u.bio, u.photo_profile,
            (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) as likes_count,
            EXISTS(SELECT 1 FROM likes WHERE recipe_id = r.id AND user_id = $2) as is_liked,
            EXISTS(SELECT 1 FROM saves WHERE recipe_id = r.id AND user_id = $2) as is_saved,
            EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = $1) as is_following
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.user_id = $1 AND r.status = 'approved'
            ORDER BY r.created_at DESC
        `;
        
        const result = await db.query(query, [userId, viewerId]);

        // Fallback jika target user belum memposting resep apapun
        let userBio = null;
        let userPhoto = null;
        let isFollowing = false;

        if (result.rows.length > 0) {
            userBio = result.rows[0].bio;
            userPhoto = result.rows[0].photo_profile;
            isFollowing = result.rows[0].is_following;
        } else {
            // Jalankan query fallback jika profile tidak memposting resep sama sekali
            const userCheck = await db.query('SELECT bio, photo_profile FROM users WHERE id = $1', [userId]);
            if(userCheck.rows.length > 0){
                userBio = userCheck.rows[0].bio;
                userPhoto = userCheck.rows[0].photo_profile;
            }
            const followCheck = await db.query(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2', 
            [viewerId, userId]);
            isFollowing = followCheck.rows.length > 0;
        }

        return res.status(200).json({
            user_id: userId,
            bio: userBio,               
            photo_profile: userPhoto,       
            is_following: isFollowing,
            total_recipes: result.rowCount,
            recipes: result.rows
        });
    } catch (error) {
        console.error('Error Get User Recipes:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil resep user tersebut' });
    }
};

// --- FUNGSI CRUD KATEGORI ---
const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        return res.status(201).json({
            message: 'Kategori berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
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
        return res.status(200).json({
            message: 'Kategori berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
        return res.status(200).json({ message: 'Kategori berhasil dihapus' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ 
                message: 'Gagal menghapus! Kategori ini masih digunakan oleh beberapa resep.' 
            });
        }
        return res.status(500).json({ error: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM categories ORDER BY name ASC");
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get Categories:', error.message);
        return res.status(500).json({ message: "Gagal mengambil kategori" });
    }
};

// --- FUNGSI SUBMISSION & VERIFIKASI ADMIN ---
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
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ message: "Gagal mengambil antrean resep" });
    }
};

const verifyRecipe = async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Status tidak valid!" });
    }

    if (status === 'rejected' && (!reason || reason.trim() === "")) {
        return res.status(400).json({ message: "Alasan penolakan wajib diisi!" });
    }

    try {
        const queryUpdate = `
            UPDATE recipes 
            SET status = $1, rejection_reason = $2, updated_at = NOW() 
            WHERE id = $3 
            RETURNING *
        `;
        const finalReason = status === 'rejected' ? reason : null;
        const result = await db.query(queryUpdate, [status, finalReason, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resep tidak ditemukan" });
        }

        const recipe = result.rows[0];

        const notifMessage = status === 'approved' 
            ? `Selamat! Resep "${recipe.title}" kamu telah disetujui. 🎉` 
            : `Maaf, resep "${recipe.title}" kamu ditolak. Alasan: ${reason} ❌`;

        await db.query(
            `INSERT INTO notifications (user_id, recipe_id, message) VALUES ($1, $2, $3)`,
            [recipe.user_id, recipe.id, notifMessage]
        );

        return res.status(200).json({ 
            message: "Validasi berhasil dan notifikasi telah dikirim ke user.", 
            recipe 
        });

    } catch (error) {
        console.error('Error Validasi & Notif:', error.message);
        return res.status(500).json({ message: "Gagal memproses validasi" });
    }
};

// --- FUNGSI NOTIFIKASI ---
const getNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ message: "Gagal mengambil notifikasi" });
    }
};

const markNotificationAsRead = async (req, res) => {
    const { id } = req.params; 
    const userId = req.user.id;

    try {
        const result = await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
        }

        return res.status(200).json({ message: "Notifikasi telah dibaca" });
    } catch (error) {
        console.error('Error Mark Read:', error.message);
        return res.status(500).json({ message: "Gagal memperbarui status notifikasi" });
    }
};

// --- FUNGSI KESELURUHAN STATISTIK (ADMIN) ---
const getRecipeStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM recipes) as total_posts,
                (SELECT COALESCE(SUM(views_count), 0) FROM recipes) as total_views,
                (SELECT COUNT(*) FROM likes) as total_likes,
                (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users
        `;
        
        const result = await db.query(statsQuery);
        const stats = result.rows[0];

        return res.status(200).json({
            total_posts: parseInt(stats.total_posts) || 0,
            total_views: parseInt(stats.total_views) || 0,
            total_likes: parseInt(stats.total_likes) || 0,
            total_users: parseInt(stats.total_users) || 0
        });
    } catch (error) {
        console.error('Error Get Recipe Stats Admin:', error.message);
        return res.status(500).json({ message: 'Gagal mengambil data statistik dashboard' });
    }
};

module.exports = { 
    // Kategori: Manajemen Resep Inti
    createRecipe, 
    updateRecipe,
    deleteRecipe,
    getAllRecipes,
    getRecipeById,
    getMyRecipes,
    getUserRecipes,
    
    // Kategori: Feed, Pencarian, & Tren
    getRecipeFeed,
    getFollowingFeed,
    getTrendingRecipes,
    searchByIngredients,
    
    // Kategori: Interaksi & Koleksi User
    toggleLike,
    getLikedRecipes,     
    
    toggleSave,
    getSavedRecipes,     
    
    toggleFollow,
    getFollowers,
    getFollowing,
    
    // Kategori: Kategori Resep
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Kategori: Fitur Kurasi Admin
    getPendingRecipes, 
    verifyRecipe,
    
    // Kategori: Fitur Pendukung
    getNotifications,
    markNotificationAsRead,
    getUserStats,
    getRecipeStats
};
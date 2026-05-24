const db = require('../config/db');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- FUNGSI REGISTER ---
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Cek apakah email sudah terdaftar
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        // 2. Hash password menggunakan Argon2
        const hashedPassword = await argon2.hash(password);

        // 3. Simpan user baru ke database
        const newUser = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // 4. LOGIKA NOTIFIKASI REGISTRASI KE ADMIN
        const adminQuery = `SELECT id FROM users WHERE role = 'admin'`;
        const admins = await db.query(adminQuery);

        if (admins.rows.length > 0) {
            const adminMessage = `User baru telah mendaftar: "${username}" (${email}).`;
            
            const notifPromises = admins.rows.map(admin => {
                return db.query(
                    `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
                    [admin.id, adminMessage]
                );
            });
            
            await Promise.all(notifPromises);
        }

        res.status(201).json({
            message: 'Registrasi berhasil!',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Register Error:', error.message);
        res.status(500).json({ message: 'Server Error saat registrasi' });
    }
};

// --- FUNGSI LOGIN ---
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Cari user berdasarkan email
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau Password salah' });
        }

        const user = userResult.rows[0];

        // 2. Verifikasi password dengan Argon2
        const isPasswordValid = await argon2.verify(user.password_hash, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau Password salah' });
        }

        // 3. Buat Access Token & Refresh Token
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // 4. Simpan Refresh Token ke Database
        await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

        // 5. Kirim respon sukses
        res.status(200).json({
            message: 'Login Berhasil!',
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role 
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server Error saat login' });
    }
};

// --- FUNGSI REFRESH TOKEN ---
const refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Refresh Token tidak ditemukan' });
    }

    try {
        // 1. Cek apakah token ada di database
        const userResult = await db.query('SELECT * FROM users WHERE refresh_token = $1', [token]);
        
        if (userResult.rows.length === 0) {
            return res.status(403).json({ message: 'Refresh Token tidak valid atau sudah dihapus' });
        }

        const user = userResult.rows[0];

        // 2. Verifikasi Refresh Token
        jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Refresh Token kadaluwarsa' });
            }

            // 3. Jika valid, buat Access Token baru
            const newAccessToken = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            res.json({ accessToken: newAccessToken });
        });

    } catch (error) {
        console.error('Refresh Token Error:', error.message);
        res.status(500).json({ message: 'Server Error saat refresh token' });
    }
};

// --- FUNGSI GET PROFILE ---
const getProfile = async (req, res) => {
    try {
        const user = await db.query('SELECT id, username, email, bio, photo_profile, role FROM users WHERE id = $1', [req.user.id]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error('Get Profile Error:', error.message);
        res.status(500).json({ message: "Gagal mengambil profil" });
    }
};

// --- FUNGSI UPDATE PROFILE (TEXT & EMAIL DATA) ---
// Perubahan: Menggunakan COALESCE agar aman jika data kosong, serta proteksi duplikasi email.
const updateProfile = async (req, res) => {
    const { username, bio, email } = req.body;
    const userId = req.user.id;

    try {
        // Cek duplikasi email jika user menginputkan email baru
        if (email) {
            const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ message: "Email sudah digunakan oleh user lain" });
            }
        }

        const query = `
            UPDATE users 
            SET username = COALESCE($1, username), 
                bio = COALESCE($2, bio), 
                email = COALESCE($3, email),
                updated_at = NOW() 
            WHERE id = $4 
            RETURNING id, username, email, bio, photo_profile, role
        `;
        const result = await db.query(query, [username, bio, email, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json({
            message: "Profil FoodieGram kamu berhasil diperbarui! ✨",
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update Profile Error:', error.message);
        res.status(500).json({ message: "Gagal memperbarui profil" });
    }
};

// --- FUNGSI UPDATE AVATAR (PHOTO PROFILE TO MINIO) ---
const updateAvatar = async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ message: 'Pilih foto terlebih dahulu' });
    }

    try {
        const photoUrl = req.file.url;

        const result = await db.query(
            'UPDATE users SET photo_profile = $1 WHERE id = $2 RETURNING photo_profile',
            [photoUrl, userId]
        );

        res.json({
            message: "Foto profil berhasil diperbarui! 📸",
            photo_profile: result.rows[0].photo_profile
        });
    } catch (error) {
        console.error('Update Avatar Error:', error.message);
        res.status(500).json({ message: "Gagal mengunggah foto profil" });
    }
};

// --- FUNGSI DELETE HANYA FOTO PROFIL ---
const deletePhotoProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            'UPDATE users SET photo_profile = NULL WHERE id = $1 RETURNING id, username, photo_profile',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json({ 
            message: "Foto profil berhasil dihapus! Sekarang kembali ke tampilan default. ✨",
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Delete Photo Error:', error.message);
        res.status(500).json({ message: "Gagal menghapus foto profil" });
    }
};

// --- FUNGSI BARU: GANTI PASSWORD USER ---
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Password lama dan baru wajib diisi!" });
    }

    try {
        // Ambil password hash lama dari database
        const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Verifikasi password lama menggunakan Argon2
        const validPassword = await argon2.verify(userRes.rows[0].password_hash, oldPassword);
        if (!validPassword) {
            return res.status(400).json({ message: "Password lama yang kamu masukkan salah!" });
        }

        // Hash password baru dengan Argon2
        const hashedNewPassword = await argon2.hash(newPassword);

        // Update ke database
        await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedNewPassword, userId]);
        return res.status(200).json({ message: "Password berhasil diperbarui! 🔐" });
    } catch (error) {
        console.error('Error Change Password:', error.message);
        return res.status(500).json({ message: "Gagal mengganti password" });
    }
};

// --- FUNGSI BARU: DASHBOARD ADMIN (LIHAT SEMUA USER) ---
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, email, role, photo_profile, created_at FROM users ORDER BY created_at DESC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error Get All Users:', error.message);
        return res.status(500).json({ message: "Gagal mengambil daftar user" });
    }
};

// --- FUNGSI BARU: DETAIL PROFIL USER TERTENTU (BERDASARKAN ID) ---
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT id, username, email, bio, photo_profile, role FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error Get User By ID:', error.message);
        return res.status(500).json({ message: "Gagal mengambil detail user" });
    }
};

module.exports = { 
    register, 
    login,
    refreshToken,
    getProfile,
    updateProfile,
    updateAvatar,
    deletePhotoProfile,
    changePassword,  
    getAllUsers,     
    getUserById      
};
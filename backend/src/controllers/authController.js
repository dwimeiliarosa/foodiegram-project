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
        // Access Token (Umur pendek - 15 menit)
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // Refresh Token (Umur panjang - 7 hari)
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // 4. Simpan Refresh Token ke Database (Update kolom refresh_token)
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
    const { token } = req.body; // Frontend mengirim refreshToken di body

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

        // 2. Verifikasi Refresh Token menggunakan Secret khusus Refresh
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

// Export semua fungsi agar bisa digunakan di routes
module.exports = { 
    register, 
    login,
    refreshToken,
    getProfile 
};
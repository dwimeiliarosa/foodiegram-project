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

        // 3. Buat JWT Token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Kirim respon sukses
        res.status(200).json({
            message: 'Login Berhasil!',
            token: token,
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

// --- FUNGSI GET PROFILE ---
const getProfile = async (req, res) => {
    try {
        // POSISI TEPAT: Tambahkan kolom 'role' di dalam query SELECT
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
    getProfile 
};
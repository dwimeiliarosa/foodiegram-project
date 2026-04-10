const express = require('express');
const router = express.Router();
// Pastikan nama di bawah ini sesuai dengan yang kamu ekspor di authController.js
const { register, login, getProfile } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const { upload, uploadAndResize } = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Sistem Autentikasi User (Register, Login, & Profile)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Mendaftarkan user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: nama kamu
 *               email:
 *                 type: string
 *                 example: emailkamu@gmail.com
 *               password:
 *                 type: string
 *                 example: passwordkamu
 *     responses:
 *       201:
 *         description: Registrasi Berhasil
 *       400:
 *         description: Email sudah digunakan
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login untuk mendapatkan token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: namakamu@gmail.com
 *               password:
 *                 type: string
 *                 example: passwordkamu
 *     responses:
 *       200:
 *         description: Login Berhasil, mengembalikan Token
 *       401:
 *         description: Email atau Password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Mendapatkan data profil user yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil profil
 *       401:
 *         description: Token tidak ditemukan
 *       403:
 *         description: Token tidak valid
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/upload-test:
 *   post:
 *     summary: Test upload gambar ke MinIO (dengan Resize Sharp)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload Berhasil
 */
router.post('/upload-test', authenticateToken, upload.single('image'), uploadAndResize, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }
    
    res.json({
        message: 'Upload berhasil!',
        url: req.file.url, // URL publik dari MinIO
        size: req.file.size,
        mimetype: req.file.mimetype
    });
});
module.exports = router;
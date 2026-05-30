const express = require('express');
const router = express.Router();

const {
    register,
    login,
    getProfile,
    refreshToken,
    updateProfile,
    updateAvatar,
    deletePhotoProfile,
    changePassword,
    getAllUsers,
    getUserById
} = require('../controllers/authController');

const authenticateToken = require('../middleware/authMiddleware');
const { upload, uploadAndResize } = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 * - name: Auth
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
 *         description: Login Berhasil, mengembalikan accessToken dan refreshToken
 *       401:
 *         description: Email atau Password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Mendapatkan Access Token baru menggunakan Refresh Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: masukkan_refresh_token_di_sini
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan Access Token baru
 *       401:
 *         description: Refresh Token tidak ditemukan
 *       403:
 *         description: Refresh Token tidak valid atau kadaluwarsa
 */
router.post('/refresh', refreshToken);

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
router.post(
    '/upload-test',
    authenticateToken,
    upload.single('image'),
    uploadAndResize,
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                message: 'Tidak ada file yang diupload'
            });
        }

        res.json({
            message: 'Upload berhasil!',
            url: req.file.url,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    }
);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update data teks profil (username, bio, & email)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: Dwi Meilia Rosa
 *               bio:
 *                 type: string
 *                 example: Backend Developer at PT Micro Data Indonesia.
 *               email:
 *                 type: string
 *                 example: dwi@example.com
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       400:
 *         description: Email sudah digunakan oleh user lain
 *       401:
 *         description: Token tidak valid
 */
router.put('/update-profile', authenticateToken, updateProfile);

/**
 * @swagger
 * /api/auth/update-avatar:
 *   put:
 *     summary: Update foto profil ke MinIO
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
 *                 description: Pilih file gambar untuk avatar.
 *     responses:
 *       200:
 *         description: Foto profil berhasil diperbarui
 *       400:
 *         description: Tidak ada file yang diunggah
 */
router.put(
    '/update-avatar',
    authenticateToken,
    upload.single('image'),
    uploadAndResize,
    updateAvatar
);

/**
 * @swagger
 * /api/auth/delete-photo:
 *   delete:
 *     summary: Menghapus foto profil (set ke default/null)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto profil berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */
router.delete('/delete-photo', authenticateToken, deletePhotoProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Mengganti password user yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: passwordlama123
 *               newPassword:
 *                 type: string
 *                 example: passwordbaru123
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui! 🔐
 *       400:
 *         description: Password lama salah atau data input kurang lengkap
 *       401:
 *         description: Token tidak valid
 */
router.put('/change-password', authenticateToken, changePassword);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Mengambil semua daftar user (Fungsi Dashboard/Admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil semua data user
 *       401:
 *         description: Token tidak valid atau tidak menyertakan token
 */
router.get('/users', authenticateToken, getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Mendapatkan detail profil user lain berdasarkan ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID dari user yang ingin dilihat detailnya
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail user
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/users/:id', authenticateToken, getUserById);

module.exports = router;
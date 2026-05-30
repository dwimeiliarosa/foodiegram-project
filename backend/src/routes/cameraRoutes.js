const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');

// Gunakan memoryStorage agar foto tidak tersimpan permanen di server/MinIO
// karena kita hanya butuh filenya untuk di-scan oleh AI
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batasi maksimal 5MB agar upload cepat
});

/**
 * @swagger
 * /api/camera/search:
 *   post:
 *     summary: Cari resep berdasarkan foto bahan makanan (Clarifai AI)
 *     tags: [Camera]
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
 *         description: Berhasil menganalisis gambar dan menemukan resep
 */

// Pastikan memanggil fungsi yang benar: searchByCamera
router.post('/search', authenticateToken, upload.single('image'), cameraController.searchByCamera);

module.exports = router;
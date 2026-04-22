const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/camera/search:
 *   post:
 *     summary: Cari resep berdasarkan foto (AI Recognition)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 detected:
 *                   type: array
 *                   items:
 *                     type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post('/search', authenticateToken, upload.single('image'), cameraController.searchByImage);

module.exports = router;
const multer = require('multer');
const sharp = require('sharp');
const { minioClient } = require('../config/minio');
require('dotenv').config();

const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Naikkan ke 50MB agar lebih aman untuk video
    fileFilter: (req, file, cb) => {
        // Izinkan gambar dan video
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya diperbolehkan mengupload gambar atau video!'), false);
        }
    }
});

const uploadAndResize = async (req, res, next) => {
    if (!req.file) return next();

    const originalName = req.file.originalname.replace(/\s/g, '-');
    const timestamp = Date.now();
    
    try {
        // --- LOGIKA 1: JIKA VIDEO ---
        if (req.file.mimetype.startsWith('video/')) {
            const fileName = `videos/${timestamp}-${originalName}`;
            
            await minioClient.putObject(
                process.env.MINIO_BUCKET,
                fileName,
                req.file.buffer,
                req.file.size, // Gunakan size asli untuk video
                { 'Content-Type': req.file.mimetype }
            );

            req.file.url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
            return next();
        }

        // --- LOGIKA 2: JIKA GAMBAR ---
        const fileName = `recipes/${timestamp}-${originalName}.webp`;

        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(800) 
            .webp({ quality: 80 })
            .toBuffer();

        await minioClient.putObject(
            process.env.MINIO_BUCKET, 
            fileName, 
            optimizedBuffer, 
            optimizedBuffer.length,
            { 'Content-Type': 'image/webp' }
        );

        req.file.url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
        next();
    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({ message: 'Gagal memproses file (Gambar/Video)' });
    }
};

module.exports = { upload, uploadAndResize };
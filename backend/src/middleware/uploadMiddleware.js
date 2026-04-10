const multer = require('multer');
const sharp = require('sharp');
const { minioClient } = require('../config/minio');
require('dotenv').config();

// Simpan sementara di memori
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    // Kita naikkan limitnya ke 20MB supaya bisa menampung video pendek (reels)
    limits: { fileSize: 20 * 1024 * 1024 }, 
});

const uploadAndResize = async (req, res, next) => {
    if (!req.file) return next();

    const originalName = req.file.originalname.replace(/\s/g, '-');
    const timestamp = Date.now();
    
    try {
        // --- LOGIKA 1: JIKA YANG DIUPLOAD ADALAH VIDEO ---
        if (req.file.mimetype.startsWith('video/')) {
            const fileName = `videos/${timestamp}-${originalName}`;
            
            await minioClient.putObject(
                process.env.MINIO_BUCKET,
                fileName,
                req.file.buffer,
                req.file.size,
                { 'Content-Type': req.file.mimetype }
            );

            // Simpan URL Video ke req.file.url
            req.file.url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
            return next(); // Langsung lanjut, tidak lewat Sharp
        }

        // --- LOGIKA 2: JIKA YANG DIUPLOAD ADALAH GAMBAR (Pakai Sharp) ---
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

        // Simpan URL Gambar ke req.file.url
        req.file.url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
        
        next();
    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({ message: 'Gagal memproses file (Gambar/Video)' });
    }
};

module.exports = { upload, uploadAndResize };
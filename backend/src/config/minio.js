const Minio = require('minio');
require('dotenv').config();

// Konfigurasi Client MinIO
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false, // Set true jika sudah pakai HTTPS
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

// Fungsi untuk memastikan bucket (wadah) sudah ada
const initBucket = async (bucketName) => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (exists) {
            console.log(`✅ Bucket '${bucketName}' sudah siap.`);
        } else {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`✨ Bucket '${bucketName}' berhasil dibuat.`);
            
            // Set Policy agar gambar bisa diakses publik lewat URL
            const policy = {
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                }]
            };
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        }
    } catch (err) {
        console.error('❌ Error MinIO Bucket:', err.message);
    }
};

module.exports = { minioClient, initBucket };
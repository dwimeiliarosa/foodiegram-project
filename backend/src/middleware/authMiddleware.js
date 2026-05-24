const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Ambil token dari header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
    }

    try {
        // Verifikasi token menggunakan secret dari .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: verified.id,
            username: verified.username,
            role: verified.role // Ini yang sangat penting untuk adminOnly
        }; // Simpan data user (id & username) ke request
        next(); // Lanjut ke fungsi controller
    } catch (error) {
        res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa' });
    }
};

module.exports = authenticateToken;
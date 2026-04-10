const adminOnly = (req, res, next) => {
    // Mengecek apakah role yang ada di req.user adalah 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // Jika benar admin, izinkan lanjut ke controller
    } else {
        // Jika bukan admin, beri respon Forbidden
        return res.status(403).json({ 
            message: "Akses ditolak! Fitur ini hanya dapat diakses oleh Admin." 
        });
    }
};

module.exports = adminOnly;
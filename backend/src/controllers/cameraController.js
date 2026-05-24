const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db'); //

// Pastikan API Key sudah ada di .env kamu
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Buka file src/controllers/cameraController.js

const searchByCamera = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Foto bahan makanan belum diunggah" });
        }

        // PERBAIKAN: Gunakan model 'gemini-1.5-flash' tanpa spesifikasi API version yang rumit
        // SDK terbaru biasanya sudah otomatis menangani ini.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const prompt = "Sebutkan satu nama bahan makanan utama di foto ini dalam bahasa Indonesia. Hanya namanya saja, misal: Ayam.";
        
        // Tambahkan timeout atau catch spesifik untuk generateContent
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const detectedIngredient = response.text().trim().replace(/\.$/, "");

        // Log untuk memastikan di terminal apa yang dideteksi AI
        console.log("AI Mendeteksi:", detectedIngredient);

        const searchQuery = `
            SELECT * FROM recipes 
            WHERE status = 'approved' 
            AND (
                title ILIKE $1 
                OR EXISTS (
                    SELECT 1 FROM unnest(ingredients) AS ing 
                    WHERE ing ILIKE $1
                )
            )
            ORDER BY created_at DESC
        `;

        const { rows } = await db.query(searchQuery, [`%${detectedIngredient}%`]);

        res.status(200).json({
            detected_label: detectedIngredient,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Camera Search Error Detail:', error); // Log detail error di terminal
        res.status(500).json({ 
            message: "Gagal memproses gambar",
            error: error.message // Tampilkan pesan error di Swagger agar mudah didebug
        });
    }
};

module.exports = { searchByCamera };
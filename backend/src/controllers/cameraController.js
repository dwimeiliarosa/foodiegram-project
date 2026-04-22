const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');

// Inisialisasi dengan Key yang sudah terbukti valid tadi
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const searchByImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Silakan upload foto" });
    }

    let ingredients = [];

    try {
        // MENGGUNAKAN MODEL YANG TERKONFIRMASI ADA DI LOG KAMU
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const imageData = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        const prompt = "Identify the main food ingredients in this image. Return ONLY the names in English, separated by commas, lowercase. Example: chicken, garlic, onion";
        
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const text = response.text();

        // Bersihkan hasil teks
        ingredients = text.split(',')
            .map(item => item.trim().toLowerCase().replace(/[^a-z]/g, ""))
            .filter(item => item.length > 0);

        console.log("✅ Gemini 2.0 Berhasil Membaca:", ingredients);

    } catch (geminiError) {
        console.error("❌ Gemini API Error:", geminiError.message);
        ingredients = []; 
    }

    try {
        // Pencarian pada kolom text[] menggunakan operator && (overlap)
        // Kita juga tambahkan pencarian case-insensitive manual agar lebih aman
        const query = `
            SELECT * FROM recipes 
            WHERE status = 'approved' 
            AND (
                ingredients && $1::text[]
                OR EXISTS (
                    SELECT 1 FROM unnest(ingredients) AS ing 
                    WHERE LOWER(ing) = ANY($1::text[])
                )
            )
            LIMIT 12
        `;
        
        const recipeResult = await db.query(query, [ingredients]);
        console.log(`✅ Database: Ditemukan ${recipeResult.rows.length} resep.`);

        return res.status(200).json({
            message: "Analisis Gambar Berhasil!",
            detected: ingredients,
            results: recipeResult.rows
        });

    } catch (dbError) {
        console.error("❌ Database Error:", dbError.message);
        return res.status(500).json({ message: "Gagal mengambil data", error: dbError.message });
    }
};

module.exports = { searchByImage };
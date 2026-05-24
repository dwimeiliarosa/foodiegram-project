const Joi = require('joi');

const recipeSchema = Joi.object({
    title: Joi.string().min(5).max(100).required().messages({
        'string.empty': 'Judul resep tidak boleh kosong',
        'string.min': 'Judul resep minimal 5 karakter'
    }),
    // Menggunakan number() tanpa .strict() supaya string "1" otomatis jadi angka 1
    category_id: Joi.number().integer().required(),
    ingredients: Joi.string().required(),
    steps: Joi.string().min(20).required(),
    cooking_time: Joi.number().min(0).default(0), 
    post_type: Joi.string().valid('photo', 'reels').default('photo'),
    
    protein: Joi.number().min(0).default(0),
    carbs: Joi.number().min(0).default(0),
    fat: Joi.number().min(0).default(0)
}).unknown(true); // .unknown(true) penting agar field 'image' dari multer tidak bikin validasi gagal

module.exports = { recipeSchema };
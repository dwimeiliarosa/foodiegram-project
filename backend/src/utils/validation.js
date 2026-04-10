const Joi = require('joi');

const recipeSchema = Joi.object({
    title: Joi.string().min(5).max(100).required().messages({
        'string.empty': 'Judul resep tidak boleh kosong',
        'string.min': 'Judul resep minimal 5 karakter'
    }),
    category_id: Joi.number().integer().required(),
    ingredients: Joi.string().required(),
    steps: Joi.string().min(20).required(),
    cooking_time: Joi.number().min(0).default(0), // Diubah agar boleh 0 (misal: jus buah)
    post_type: Joi.string().valid('photo', 'reels').default('photo'),
    
    // TAMBAHKAN .default(0) DI SINI
    protein: Joi.number().min(0).default(0),
    carbs: Joi.number().min(0).default(0),
    fat: Joi.number().min(0).default(0)
});

module.exports = { recipeSchema };
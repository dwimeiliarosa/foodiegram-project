const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require('./config/db'); 
const authRoutes = require('./routes/authRoutes'); 
// --- 1. LETAKKAN IMPORT DI SINI ---
const recipeRoutes = require('./routes/recipeRoutes'); 

const { initBucket } = require('./config/minio'); 
require('dotenv').config();

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json()); 

// --- 2. Konfigurasi Swagger ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodieGram API Documentation 🥗',
      version: '1.0.0',
      description: 'Dokumentasi API untuk Project Social Recipe Platform - PKL Polinela',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 3. Inisialisasi Layanan (DB & Storage) ---

// Cek Koneksi Database
const testDb = async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('✅ Terhubung ke database PostgreSQL');
    console.log('🕒 Waktu Database:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Gagal konek database:', err.message);
  }
};
testDb();

// Inisialisasi Bucket MinIO
initBucket(process.env.MINIO_BUCKET || 'foodiegram');

// --- 4. Daftar Routes ---
app.use('/api/auth', authRoutes); 
app.use('/api/recipes', recipeRoutes); 

app.get('/', (req, res) => {
  res.send('Server FoodieGram Berjalan! 🥗');
});

// --- 5. GLOBAL ERROR HANDLER (TAMBAHKAN INI SEBELUM app.listen) ---
app.use((err, req, res, next) => {
    console.error('Global Error:', err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Terjadi kesalahan pada server internal'
    });
});

// --- 6. Jalankan Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  // Tambahkan baris di bawah ini supaya link dokumentasinya muncul
  console.log(`📜 Swagger UI ready at http://localhost:${PORT}/api-docs`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Tes Route Dasar
app.get('/', (req, res) => {
  res.send('Server FoodieGram Berjalan! 🥗');
});

// Port dari file .env atau default 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // Memastikan browser tidak menyimpan cache HTTP secara agresif
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

api.interceptors.request.use((config) => {
  // 1. Ambil token (Pastikan di proses login kamu menyimpan dengan nama 'authToken')
  const token = localStorage.getItem("authToken"); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token terpasang di header."); 
  } else {
    console.log("Token tidak ditemukan di LocalStorage! Menjalankan request sebagai guest/anonim."); 
  }

  // 2. PERBAIKAN: Pindahkan ke luar blok 'if (token)' agar request user non-login (guest) 
  // tetap mendapatkan timestamp unik dan terhindar dari error 304 Not Modified.
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
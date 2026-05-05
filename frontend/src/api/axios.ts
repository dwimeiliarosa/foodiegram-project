import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

api.interceptors.request.use((config) => {
  // PASTIKAN: Tidak ada spasi antara 'auth' dan 'Token'
  // Harus sama dengan yang kamu tulis di Login.tsx
  const token = localStorage.getItem("authToken"); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token terpasang di header:", token); // Log untuk memastikan
  } else {
    console.log("Token tidak ditemukan di LocalStorage!"); 
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
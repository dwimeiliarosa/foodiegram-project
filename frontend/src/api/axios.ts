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

// 2. Interceptor Response: Tangani jika token kadaluwarsa (Error 401)
api.interceptors.response.use(
  (response) => response, // Jika sukses, langsung teruskan
  async (error) => {
    // 🎯 PERBAIKAN TS: Berikan tipe 'any' agar properti _retry tidak dianggap error oleh TypeScript
    const originalRequest = error.config as any;

    // Jika error 401 (Unauthorized) dan belum pernah mencoba refresh sebelumnya
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {
          refreshToken: refreshToken,
        });

        if (res.status === 200) {
          // Sesuai JSON kamu: accessToken ada di res.data langsung
          const accessToken = res.data.accessToken; 
          
          if (accessToken) {
            localStorage.setItem("authToken", accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Jika refresh token juga gagal/kadaluwarsa, paksa logout
        console.error("Refresh token expired", refreshError);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
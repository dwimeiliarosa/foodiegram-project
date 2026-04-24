import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 1. Interceptor Request: Pasang token di setiap permintaan
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor Response: Tangani jika token kadaluwarsa (Error 401)
api.interceptors.response.use(
  (response) => response, // Jika sukses, langsung teruskan
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 (Unauthorized) dan belum pernah mencoba refresh sebelumnya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Panggil endpoint refresh backend (sesuaikan path-nya, biasanya /auth/refresh)
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {
          refreshToken: refreshToken,
        });

        if (res.status === 200) {
          const { accessToken } = res.data.data || res.data;
          
          // Simpan token baru
          localStorage.setItem("authToken", accessToken);

          // Update header request yang tadi gagal dan jalankan ulang
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
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
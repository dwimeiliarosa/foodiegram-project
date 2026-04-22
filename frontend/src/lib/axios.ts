import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 detik
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // Ambil kunci dari dompet digital
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
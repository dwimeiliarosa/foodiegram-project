import { createContext, useState, useEffect, useContext } from "react";
import api from "./../api/axios"; // Menggunakan api.ts yang kita buat tadi

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk ambil data profil dari backend
  const getProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data); // Simpan data user (nama, foto, dll) ke state
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Cek profil setiap kali aplikasi di-refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, getProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom agar panggilnya gampang di halaman lain
export const useAuth = () => useContext(AuthContext);
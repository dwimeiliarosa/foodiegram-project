import { ChevronLeft, LogOut, User, Bell, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Berhasil keluar!");
    navigate("/login"); // Pastikan rute login ada
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)}><ChevronLeft /></button>
        <h1 className="text-lg font-bold">Pengaturan Akun</h1>
      </header>

      <div className="p-4 space-y-2 max-w-2xl mx-auto">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3"><User size={20} /> Profil Pribadi</div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3"><Bell size={20} /> Notifikasi</div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3"><Shield size={20} /> Keamanan</div>
        </div>

        {/* Tombol Logout dipindahkan ke sini */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 mt-10 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100"
        >
          <LogOut size={20} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
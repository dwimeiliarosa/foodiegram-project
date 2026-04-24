import { LogOut, User as UserIcon, Settings, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  // Ambil data user dari localStorage yang disimpan saat login
  // Gunakan JSON.parse karena data 'user' disimpan sebagai string
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : { username: "Pengguna", email: "-" };

  const handleLogout = () => {
    toast.error("Keluar dari FoodieGram...");
    
    // Hapus semua data session agar tidak ada sisa token atau role
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");

    // Paksa refresh ke halaman login agar semua state React ter-reset
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto pt-4 pb-20">
      {/* Kartu Profil Utama */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
          <UserIcon size={48} className="text-[#F27F22]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{userData.username}</h1>
        <p className="text-slate-500 text-sm mb-3">{userData.email}</p>
        
        {/* Label Role */}
        <div className="px-3 py-1 bg-orange-50 text-[#F27F22] text-[10px] font-bold rounded-full uppercase tracking-widest">
          {localStorage.getItem("userRole") || "User"}
        </div>
      </div>

      {/* Menu Opsi */}
      <div className="space-y-3 px-2">
        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-xl text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
              <Settings size={20} />
            </div>
            <span className="font-semibold text-slate-700">Pengaturan Akun</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* Tombol Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:bg-red-50 group transition-all border border-transparent hover:border-red-100"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all">
              <LogOut size={20} />
            </div>
            <span className="font-semibold text-red-600">Keluar Aplikasi</span>
          </div>
          <ChevronRight size={18} className="text-red-300" />
        </button>
      </div>

      <div className="text-center mt-12 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
        FoodieGram &bull; Wanda Frontend
      </div>
    </div>
  );
};

export default Profile;
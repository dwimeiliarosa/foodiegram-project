import React, { useState, useEffect } from "react";
import { User, Shield, Camera, Edit2, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "../../lib/axios"; 
import { toast } from "sonner";

export default function ProfileAdmin() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // State untuk visibilitas password text
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // State Form Ubah Password sesuai Swagger Dwi
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: ""
  });
  
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    bio: "",
    avatar_url: "",
    role: "Frontend Admin"
  });

  const [stats, setStats] = useState({
    total_recipes: 0,
    total_views: 0,
    total_likes: 0
  });

  // 1. Ambil data profil (GET /api/auth/profile) & statistik (GET /api/recipes/stats)
  const fetchProfileAndStats = async () => {
    try {
      const profileRes = await api.get("/auth/profile");
      const pData = profileRes.data; 
      
      setAdminData(prev => ({
        ...prev,
        name: pData.username || "Admin FoodieGram",
        email: pData.email || "",
        bio: pData.bio || "",
        avatar_url: pData.photo_profile || "" 
      }));

      const statsRes = await api.get("/recipes/stats");
      const sData = statsRes.data.data || statsRes.data;
      setStats({
        total_recipes: sData.total_recipes || 0,
        total_views: sData.total_views || 0,
        total_likes: sData.total_likes || 0
      });

    } catch (err) {
      console.error("Gagal sinkronisasi data dengan Swagger Backend", err);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  // 2. Perbarui Teks Profil (PUT /api/auth/update-profile)
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await api.put("/auth/update-profile", {
        username: adminData.name,
        bio: adminData.bio
      });
      
      toast.success("Profil personal berhasil diperbarui!");
      setIsEditing(false);
      fetchProfileAndStats();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Unggah Avatar ke MinIO via Backend (PUT /api/auth/update-avatar)
  const handleUpdateAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); 

    try {
      toast.loading("Mengunggah berkas gambar ke Object Storage MinIO...");
      
      await api.put("/auth/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.dismiss();
      toast.success("Foto profil berhasil disimpan di MinIO Storage!");
      
      setTimeout(() => {
        fetchProfileAndStats(); 
      }, 800);
      
    } catch (err: any) {
      toast.dismiss();
      console.error("Error upload avatar:", err);
      toast.error(err.response?.data?.message || "Gagal mengunggah berkas.");
    }
  };

  // 4. INTEGRASI BARU: Ubah Password Mandiri (PUT /api/auth/change-password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("Semua field kata sandi wajib diisi!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Kata sandi baru minimal harus berjumlah 6 karakter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Menembak endpoint Swagger Dwi dengan Request Body application/json
      await api.put("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success("Kata sandi akun admin berhasil diperbarui! 🔐");
      // Reset form input setelah sukses ganti password
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err: any) {
      console.error("Gagal merubah password:", err);
      const msg = err.response?.data?.message || "Password lama salah atau data input kurang lengkap.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Profil Admin</h1>
            <p className="text-slate-500 text-sm">Kelola informasi kredensial personal dan monitor performa sistem FoodieGram.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bagian Kiri: Foto Utama */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center h-fit">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                  {adminData.avatar_url ? (
                    <img 
                      src={adminData.avatar_url} 
                      alt="Avatar Admin" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150";
                      }}
                    />
                  ) : (
                    <User size={64} className="text-[#F27F22]" />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full border shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
                  <Camera size={16} className="text-slate-600" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleUpdateAvatar} 
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold">{adminData.name}</h2>
              <span className="px-3 py-1 bg-orange-100 text-[#F27F22] text-xs font-bold rounded-full mt-2 uppercase tracking-wider">
                {adminData.role}
              </span>
              
              <div className="w-full grid grid-cols-3 gap-2 mt-8 pt-6 border-t text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Resep</p>
                  <p className="text-base font-bold text-slate-700">{stats.total_recipes}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Views</p>
                  <p className="text-base font-bold text-blue-600">{stats.total_views}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Suka</p>
                  <p className="text-base font-bold text-red-600">{stats.total_likes}</p>
                </div>
              </div>
            </div>

            {/* Bagian Kanan: Input Form Informasi & Ubah Password */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Informasi Personal */}
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Informasi Personal</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[#F27F22] hover:text-[#d96d1a]"
                  >
                    <Edit2 size={16} className="mr-2" /> {isEditing ? "Batal" : "Edit Profil"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Lengkap / Username</Label>
                      <Input 
                        disabled={!isEditing} 
                        value={adminData.name}
                        onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Akun</Label>
                      <Input 
                        disabled={true} 
                        value={adminData.email || "admindwi@gmail.com"}
                        className="bg-slate-50 cursor-not-allowed text-slate-400" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Bio Keterangan</Label>
                    <textarea 
                      disabled={!isEditing} 
                      value={adminData.bio}
                      onChange={(e) => setAdminData({...adminData, bio: e.target.value})}
                      placeholder="Belum ada deskripsi bio singkat."
                      className="w-full min-h-[100px] p-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#F27F22] outline-none disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hak Akses Sistem</Label>
                    <div className="flex items-center p-3 bg-slate-50 border rounded-lg text-xs text-slate-600">
                      <Shield size={14} className="mr-2 text-[#F27F22]" />
                      Full Root Access Control: Moderator Peninjau Konten Publik & Manajemen Pengguna.
                    </div>
                  </div>

                  {isEditing && (
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      className="bg-[#F27F22] hover:bg-[#d96d1a] w-full md:w-auto mt-4 text-white font-semibold"
                    >
                      {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Simpan Perubahan"}
                    </Button>
                  )}
                </div>
              </div>

              {/* REVISI UTAMA: Card 2 - Form Ubah Kredensial Keamanan Akun */}
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b pb-3">
                  <KeyRound className="text-[#F27F22]" size={20} />
                  <h3 className="font-bold text-lg">Perbarui Kata Sandi</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Input Password Lama */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="old_pwd">Kata Sandi Lama</Label>
                    <div className="relative">
                      <Input 
                        id="old_pwd"
                        type={showOldPassword ? "text" : "password"} 
                        placeholder="Masukkan password saat ini"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="bg-white pr-10 focus-visible:ring-[#F27F22]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Input Password Baru */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="new_pwd">Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input 
                        id="new_pwd"
                        type={showNewPassword ? "text" : "password"} 
                        placeholder="Masukkan password baru minimal 6 karakter"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="bg-white pr-10 focus-visible:ring-[#F27F22]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Eksekusi Perubahan */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-[#F27F22] hover:bg-[#d96d1a] text-white font-semibold px-6"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Memproses Keamanan...
                        </>
                      ) : (
                        "Ganti Password Akun"
                      )}
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
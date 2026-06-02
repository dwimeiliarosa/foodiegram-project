import React, { useState, useEffect } from "react";
import { User, Shield, Camera, Edit2, Loader2, Info } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import api from "../../lib/axios"; 
import { toast } from "sonner";

export default function ProfileAdmin() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
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

  // 💡 JALUR PENYELAMAT URL MINIO (SUB-FOLDER RECIPES)
  const formatAvatarUrl = (url: string) => {
    if (!url) return "";
    
    // Jika backend sudah mengembalikan URL lengkap (http:// atau https://), langsung gunakan
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // 🛠️ ANALISIS MINIO: File kamu masuk ke bucket 'foodiegram' sub-folder 'recipes'
    // Kita arahkan langsung ke API Gateway MinIO (Port 9000) agar gambar langsung jebol tampil
    return `http://localhost:9000/foodiegram/recipes/${url}`;
    
    // CATATAN: Jika Dwi membuat route static di backend express (Port 5000), 
    // jika baris di atas masih kosong, kamu bisa ganti dengan baris di bawah ini:
    // return `http://localhost:5000/uploads/recipes/${url}`;
  };

  // 1. Ambil data profil (GET /api/auth/profile) & statistik (GET /api/recipes/stats)
  const fetchProfileAndStats = async () => {
    try {
      const profileRes = await api.get("/auth/profile");
      // Sesuai Preview Network, data langsung berada di level utama response (profileRes.data)
      const pData = profileRes.data; 
      
      setAdminData(prev => ({
        ...prev,
        name: pData.username || "Admin FoodieGram",
        email: pData.email || "",
        bio: pData.bio || "",
        // 🎯 KUNCI UTAMA: Tembak langsung ke property photo_profile dari backend Dwi
        avatar_url: pData.photo_profile || "" 
      }));

      // Sinkronisasi data statistik riil
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
    // Berdasarkan testing kamu, key "image" terbukti lolos ke backend & masuk ke MinIO!
    formData.append("image", file); 

    try {
      toast.loading("Mengunggah berkas gambar ke Object Storage MinIO...");
      
      await api.put("/auth/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.dismiss();
      toast.success("Foto profil berhasil disimpan di MinIO Storage!");
      
      // Delay sedikit memberikan waktu bagi database backend untuk melakukan commit data terbaru
      setTimeout(() => {
        fetchProfileAndStats(); 
      }, 800);
      
    } catch (err: any) {
      toast.dismiss();
      console.error("Error upload avatar:", err);
      toast.error(err.response?.data?.message || "Gagal mengunggah berkas.");
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
            {/* Bagian Kiri: Foto Utama Terintegrasi MinIO */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center h-fit">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                  {adminData.avatar_url ? (
                    <img 
                      src={adminData.avatar_url} // 👈 Langsung panggil variabelnya di sini
                      alt="Avatar Admin" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback otomatis jika server MinIO Dwi sedang mati/offline
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
              
              {/* Data Performa Riil Berdasarkan Hasil Integrasi Endpoint Stats */}
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

            {/* Bagian Kanan: Input Form Informasi */}
            <div className="lg:col-span-2 space-y-6">
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

              {/* Box Informasi Regulasi Akun Keamanan */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setIsInfoModalOpen(true)}>
                <div className="p-3 bg-orange-50 text-[#F27F22] rounded-xl">
                  <Info size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-800">Manajemen Kredensial Keamanan</h4>
                  <p className="text-xs text-slate-500">Klik untuk melihat regulasi pembaruan kata sandi institusi PKL Polinela.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Kebijakan Akun Keamanan</DialogTitle>
            <DialogDescription className="pt-2 text-slate-600 text-sm leading-relaxed">
              Berdasarkan pemetaan gerbang logika pada **FoodieGram API Documentation (OAS 3.0)**, mekanisme modifikasi kata sandi secara mandiri ditiadakan demi mematuhi aspek integritas basis data internal perusahaan.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-slate-50 text-[11px] text-slate-500 rounded-lg border leading-relaxed">
            <strong>Catatan Sinkronisasi:</strong> Seluruh kendala perubahan kata sandi untuk akun administrator wajib dijembatani langsung melalui tim struktural Database Administrator (DBA) atau menghubungi Dwi selaku Backend Engineer.
          </div>
          <DialogFooter>
            <Button type="button" className="bg-[#F27F22] hover:bg-[#d96d1a] text-white w-full font-semibold" onClick={() => setIsInfoModalOpen(false)}>
              Saya Mengerti & Valid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
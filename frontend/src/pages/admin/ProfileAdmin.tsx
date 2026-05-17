import React, { useState, useEffect } from "react";
import { User, Shield, Camera, Edit2} from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import { Button } from "../../components/ui/button"; // Jika menggunakan Shadcn
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import api from "../../lib/axios";
import { toast } from "sonner";

export default function ProfileAdmin() {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    bio: "",
    role: "Frontend Admin 1",
    total_verified: 0,
    total_rejected: 0
  });

  // 1. Ambil data profil saat halaman dibuka
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const data = res.data.data || res.data;
        setAdminData(prev => ({
          ...prev,
          name: data.username,
          email: data.email
        }));
      } catch (err) {
        console.error("Gagal ambil data", err);
      }
    };
    fetchProfile();
  }, []);

// 2. Fungsi untuk Update Teks (Nama & Email)
const handleUpdateProfile = async () => {
  try {
    await api.put("/auth/update-profile", {
      username: adminData.name,
      bio: adminData.bio // Sekarang kita kirim Bio ke backend
    });
    
    toast.success("Profil berhasil diperbarui!");
    setIsEditing(false);
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.message || "Gagal memperbarui profil");
  }
};

// 3. Fungsi untuk Update Foto (Avatar)
const handleUpdateAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("photo_profile", file); // Sesuaikan key-nya dengan backend Dwi

  try {
    await api.put("/auth/update-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    toast.success("Foto profil diperbarui!");
    // Panggil ulang fetchProfile untuk melihat perubahan foto
  } catch (err) {
    toast.error("Gagal mengunggah foto");
  }
};

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Profil Admin</h1>
            <p className="text-slate-500 text-sm">Kelola informasi akun dan pantau performa verifikasi Anda.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kartu Samping: Foto & Role */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                   {/* Ganti dengan <img src={...} /> jika sudah ada fotonya */}
                  <User size={64} className="text-[#F27F22]" />
                </div>
                <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full border shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
                  <Camera size={16} className="text-slate-600" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleUpdateAvatar} // <--- TEMPEL DI SINI
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold">{adminData.name}</h2>
              <span className="px-3 py-1 bg-orange-100 text-[#F27F22] text-xs font-bold rounded-full mt-2 uppercase tracking-wider">
                {adminData.role}
              </span>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Verified</p>
                  <p className="text-lg font-bold text-green-600">{adminData.total_verified}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Rejected</p>
                  <p className="text-lg font-bold text-red-600">{adminData.total_rejected}</p>
                </div>
              </div>
            </div>

            {/* Form Informasi Akun */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Informasi Personal</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[#F27F22]"
                  >
                    <Edit2 size={16} className="mr-2" /> {isEditing ? "Batal" : "Edit Profil"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NAMA - BISA DIEDIT */}
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <Input 
                        disabled={!isEditing} 
                        value={adminData.name}
                        onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                        className="bg-white"
                      />
                    </div>

                    {/* EMAIL - DISABLE (READ ONLY) */}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        disabled={true} // Selalu disable karena backend tidak support update email di sini
                        value={adminData.email}
                        className="bg-slate-50 cursor-not-allowed" // Beri warna beda agar user paham tidak bisa diedit
                      />
                      <p className="text-[10px] text-slate-400">*Email tidak dapat diubah demi keamanan akun</p>
                    </div>
                  </div>

                  {/* BIO - TAMBAHKAN BARIS BARU */}
                  <div className="space-y-2 mt-4">
                    <Label>Bio</Label>
                    <textarea 
                      disabled={!isEditing} 
                      value={adminData.bio || ""}
                      onChange={(e) => setAdminData({...adminData, bio: e.target.value})}
                      placeholder="Tulis bio singkat Anda di sini..."
                      className="w-full min-h-[100px] p-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#F27F22] outline-none disabled:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role Akses</Label>
                    <div className="flex items-center p-3 bg-slate-50 border rounded-lg text-sm text-slate-600">
                      <Shield size={16} className="mr-2 text-[#F27F22]" />
                      Full Access: Resep, User, & Dashboard Management
                    </div>
                  </div>

                  {isEditing && (
                    <Button onClick={handleUpdateProfile}
                    className="bg-[#F27F22] hover:bg-[#d96d1a] w-full md:w-auto mt-4">
                      Simpan Perubahan
                    </Button>
                  )}
                </div>
              </div>

              {/* Bagian Keamanan (Ganti Password) */}
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="font-bold text-lg mb-6">Keamanan</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Ganti Kata Sandi</p>
                          <p className="text-xs text-slate-500">Ubah kata sandi akun Anda secara berkala</p>
                        </div>
                      </div>
                      <Edit2 size={16} className="text-slate-400" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
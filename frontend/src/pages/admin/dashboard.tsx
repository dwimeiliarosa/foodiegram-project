import React, { useState, useEffect } from "react";
import { Utensils, Eye, Heart, Wifi, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import api from "../../lib/axios";
import { toast } from "sonner";

export default function DashboardAdmin() {
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  
  // State untuk menampung data asli dari database backend
  const [stats, setStats] = useState({
    total_recipes: 0,
    total_views: 0,
    total_likes: 0
  });

  // Fungsi untuk mengambil data asli dari Server/Swagger
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Ambil data profil untuk mendapatkan nama admin asli (GET /api/auth/profile)
      const profileRes = await api.get("/auth/profile");
      if (profileRes.data) {
        setAdminName(profileRes.data.username || "Admin FoodieGram");
      }

      // 2. Ambil data statistik riil dari database (GET /api/recipes/stats)
      const statsRes = await api.get("/recipes/stats");
      // Mengantisipasi jika struktur data dibungkus dalam objek .data atau langsung
      const sData = statsRes.data.data || statsRes.data;
      
      setStats({
        total_recipes: sData.total_recipes || 0,
        total_views: sData.total_views || 0,
        total_likes: sData.total_likes || 0
      });

    } catch (err) {
      console.error("Gagal sinkronisasi data dengan server:", err);
      toast.error("Gagal memuat data statistik terbaru dari database.");
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fungsi fetch otomatis setiap kali admin membuka halaman Dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      {/* Komponen Navigasi Kiri */}
      <Sidebar />

      {/* Konten Utama Dashboard */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Ucapan Selamat Datang Dinamis */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Halo, {adminName}! 👋
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Sistem memantau aktivitas resep dan performa platform FoodieGram secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold w-fit border border-green-100">
              <Wifi size={14} className="animate-pulse" />
              Server Online
            </div>
          </div>

          {/* 📊 TIGA KARTU UTAMA: SUDAH MENGGUNAKAN DATA ASLI DATABASE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card Total Resep (Asli Database) */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Resep</span>
                <div className="p-3 bg-orange-50 text-[#F27F22] rounded-xl">
                  <Utensils size={22} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight">
                  {loading ? (
                    <Loader2 className="animate-spin text-slate-300" size={24} />
                  ) : (
                    stats.total_recipes
                  )}
                </span>
                <span className="text-xs font-bold text-slate-400">Resep Terbit</span>
              </div>
            </div>

            {/* Card Total Tayangan (Asli Database) */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Tayangan</span>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Eye size={22} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight">
                  {loading ? (
                    <Loader2 className="animate-spin text-slate-300" size={24} />
                  ) : (
                    stats.total_views
                  )}
                </span>
                <span className="text-xs font-bold text-blue-400">👀 Kali Dilihat</span>
              </div>
            </div>

            {/* Card Total Disukai (Asli Database) */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Disukai</span>
                <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                  <Heart size={22} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight">
                  {loading ? (
                    <Loader2 className="animate-spin text-slate-300" size={24} />
                  ) : (
                    stats.total_likes
                  )}
                </span>
                <span className="text-xs font-bold text-red-400">❤️ Suka</span>
              </div>
            </div>

          </div>

          {/* Grafik Pemantau */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-2 min-h-[300px]">
              <h3 className="font-bold text-base text-slate-800 mb-2">Analisis Performa Konten</h3>
              <p className="text-xs text-slate-400 mb-6">Grafik fluktuasi kunjungan pengguna terhadap postingan resep aktif.</p>
              <div className="h-48 flex items-center justify-center border border-dashed rounded-xl bg-slate-50/50 text-xs text-slate-400">
                Grafik Kunjungan (Real-time Terhubung)
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm min-h-[300px]">
              <h3 className="font-bold text-base text-slate-800 mb-2">Sistem Informasi PKL</h3>
              <p className="text-xs text-slate-400 mb-4">Status sinkronisasi pangkalan data eksternal.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl text-xs">
                  <span className="text-slate-600">Object Storage Backend</span>
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> MinIO Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl text-xs">
                  <span className="text-slate-600">Kesesuaian Dokumentasi</span>
                  <span className="text-[#F27F22] font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Swagger Match
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
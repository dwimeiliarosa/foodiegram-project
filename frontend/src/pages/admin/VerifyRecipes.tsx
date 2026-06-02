import React, { useState, useEffect } from "react";
import { Check, X, Loader2, AlertCircle, Utensils } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import api from "../../lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  photo_profile?: string;
  status: string;
  user?: {
    username: string;
  };
}

export default function VerifyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // 1. Ambil daftar resep PENDING dari database (GET /api/recipes/admin/pending)
  const fetchPendingRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recipes/admin/pending");
      const data = res.data.data || res.data;
      
      // Pastikan data berbentuk array sebelum dimasukkan ke state
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat resep pending:", err);
      toast.error("Gagal mengambil data resep pending dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  // 2. Aksi Verifikasi: SETUJU / TOLAK (PATCH /api/recipes/admin/verify/{id})
  const handleVerify = async (id: number, isApproved: boolean) => {
    try {
      setActionLoadingId(id);
      
      // Kirim status 'approved' jika disetujui, atau 'rejected' jika ditolak sesuai request body backend
      await api.patch(`/recipes/admin/verify/${id}`, {
        status: isApproved ? "approved" : "rejected"
      });

      toast.success(isApproved ? "Resep berhasil disetujui publik!" : "Resep telah ditolak.");
      
      // Muat ulang data resep pending yang tersisa
      fetchPendingRecipes();
    } catch (err: any) {
      console.error("Gagal melakukan verifikasi resep:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui status verifikasi resep.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Verifikasi Resep Kuliner</h1>
            <p className="text-slate-500 text-sm">Tinjau, setujui, atau tolak kiriman resep baru dari para pengguna FoodieGram.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2 bg-white rounded-2xl border shadow-sm">
              <Loader2 className="animate-spin text-[#F27F22]" size={32} />
              <p className="text-xs text-slate-400 font-medium">Menyelaraskan data antrean resep...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border shadow-sm p-6">
              <div className="p-4 bg-orange-50 text-[#F27F22] rounded-full mb-4">
                <Utensils size={32} />
              </div>
              <h3 className="font-bold text-slate-700">Antrean Bersih!</h3>
              <p className="text-slate-400 text-xs max-w-xs mt-1">
                Tidak ada kiriman resep baru dari user yang membutuhkan verifikasi saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                  
                  {/* Bagian Konten Kartu */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100">
                        Status: Pending Review
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Oleh: @{recipe.user?.username || "user_foodie"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{recipe.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{recipe.description}</p>
                    </div>

                    {/* Pratinjau Gambar Masuk (Jika Ada Jalur URL) */}
                    {(recipe.image_url || recipe.photo_profile) && (
                      <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden border">
                        <img 
                          src={recipe.image_url || recipe.photo_profile} 
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi Kontrol Akses Terintegrasi PATCH Swagger */}
                  <div className="p-4 bg-slate-50 border-t flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(recipe.id, false)}
                      disabled={actionLoadingId !== null}
                      className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold"
                    >
                      {actionLoadingId === recipe.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <X size={14} className="mr-1.5" /> Tolak
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleVerify(recipe.id, true)}
                      disabled={actionLoadingId !== null}
                      className="flex-1 bg-[#F27F22] hover:bg-[#d96d1a] text-white font-semibold"
                    >
                      {actionLoadingId === recipe.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <Check size={14} className="mr-1.5" /> Setujui
                        </>
                      )}
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
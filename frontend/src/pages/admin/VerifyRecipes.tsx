import React, { useState, useEffect } from "react";
import { Check, X, Loader2, Utensils, AlertTriangle } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import api from "../../lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

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
  
  // State manajemen modal penolakan resep
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const location = useLocation();
  const highlightId = location.state?.highlightRecipeId;

  const fetchPendingRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recipes/admin/pending");
      const data = res.data.data || res.data;
      let finalRecipes = Array.isArray(data) ? data : [];

      // 🔥 Sempurnakan di sini: Jika diakses dari klik lonceng, taruh resep tersebut di paling atas!
      if (highlightId) {
        finalRecipes = [...finalRecipes].sort((a, b) => (a.id === highlightId ? -1 : b.id === highlightId ? 1 : 0));
      }

      setRecipes(finalRecipes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  // Membuka jendela dialog alasan penolakan
  const openRejectModal = (id: number) => {
    setSelectedRecipeId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Eksekusi aksi Verifikasi (Setuju / Tolak dengan Form Alasan Tekstual)
  const handleVerify = async (id: number, isApproved: boolean) => {
    try {
      setActionLoadingId(id);
      
      const payload: any = { status: isApproved ? "approved" : "rejected" };
      if (!isApproved) {
        payload.reason = rejectReason || "Foto resep kurang jelas atau deskripsi tidak valid.";
      }

      await api.patch(`/recipes/admin/verify/${id}`, payload);

      toast.success(isApproved ? "Resep berhasil disetujui publik!" : "Resep telah ditolak beserta alasan.");
      setIsRejectModalOpen(false);
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

      <main className="flex-1 min-w-0 lg:pl-64 p-4 lg:p-8 w-full overflow-x-hidden">
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
              <h3 className="font-bold text-slate-700">Antrean Clean!</h3>
              <p className="text-slate-400 text-xs max-w-xs mt-1">Tidak ada kiriman resep baru dari user yang membutuhkan verifikasi saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe) => {
                // 🎯 DETEKSI: Apakah resep ini yang diklik dari lonceng?
                const isHighlighted = recipe.id === highlightId;

                return (
                  <div 
                    key={recipe.id} 
                    className={`bg-white rounded-2xl border flex flex-col justify-between hover:shadow-md transition-all duration-500 overflow-hidden ${
                      isHighlighted 
                        ? "ring-2 ring-[#F27F22] border-transparent shadow-lg shadow-orange-100 animate-pulse bg-orange-50/20" 
                        : "border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100">
                          Status: Pending Review
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Oleh: @{recipe.user?.username || "user_foodie"}</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{recipe.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{recipe.description}</p>
                      </div>

                      {(recipe.image_url || recipe.photo_profile) && (
                        <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden border">
                          <img 
                            src={recipe.image_url || recipe.photo_profile} 
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400"; }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => openRejectModal(recipe.id)}
                        disabled={actionLoadingId !== null}
                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold"
                      >
                        <X size={14} className="mr-1.5" /> Tolak
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleVerify(recipe.id, true)}
                        disabled={actionLoadingId !== null}
                        className="flex-1 bg-[#F27F22] hover:bg-[#d96d1a] text-white font-semibold"
                      >
                        {actionLoadingId === recipe.id ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} className="mr-1.5" /> Setujui</>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* COMPONENT MODAL POPUP ALASAN PENOLAKAN KUSTOM */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-lg">Alasan Penolakan Resep</h3>
            </div>
            <p className="text-xs text-slate-500">Berikan keterangan penolakan yang logis. Alasan ini akan langsung dikirim ke notifikasi aplikasi mobile user.</p>
            
            <textarea
              className="w-full h-24 p-3 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-slate-700 bg-slate-50"
              placeholder="Contoh: Maaf, foto resep buram atau mengandung unsur duplikasi..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button size="sm" variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="text-slate-500 text-xs">
                Batal
              </Button>
              <Button 
                size="sm" 
                onClick={() => selectedRecipeId && handleVerify(selectedRecipeId, false)}
                disabled={!rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4"
              >
                Kirrim Penolakan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
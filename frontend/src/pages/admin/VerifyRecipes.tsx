import React, { useState, useEffect } from "react";
import { Check, X, Loader2, Utensils, AlertTriangle, Clock, Flame, Eye, Scale, BookOpen, Layers } from "lucide-react";
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
  cooking_time?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  calories?: number;
  ingredients?: string[]; // atau string jika dari backend berupa text panjang
  instructions?: string[]; // atau string jika dari backend berupa text panjang
  portions?: number;
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

  // State BARU untuk melihat detail resep utuh
  const [selectedPreviewRecipe, setSelectedPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const location = useLocation();
  const highlightId = location.state?.highlightRecipeId;

  const fetchPendingRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recipes/admin/pending");
      const data = res.data.data || res.data;
      let finalRecipes = Array.isArray(data) ? data : [];

      // Jika diakses dari klik lonceng, taruh resep tersebut di paling atas!
      if (highlightId) {
        finalRecipes = [...finalRecipes].sort((a, b) => (a.id === highlightId ? -1 : b.id === highlightId ? 1 : 0));
        
        // AUTO-OPEN PREVIEW: Jika ada ID dari notifikasi, langsung bukakan modal detailnya agar admin bisa langsung baca
        const matched = finalRecipes.find(r => r.id === highlightId);
        if (matched) {
          openPreviewModal(matched);
        }
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
  }, [highlightId]);

  // Membuka jendela dialog alasan penolakan
  const openRejectModal = (id: number) => {
    setSelectedRecipeId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Membuka jendela pratinjau resep lengkap
  const openPreviewModal = (recipe: Recipe) => {
    setSelectedPreviewRecipe(recipe);
    setIsPreviewModalOpen(true);
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
      setIsPreviewModalOpen(false); // Tutup juga modal preview jika sedang terbuka
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
                const isHighlighted = recipe.id === highlightId;

                return (
                  <div 
                    key={recipe.id} 
                    className={`bg-white rounded-2xl border flex flex-col justify-between hover:shadow-md transition-all duration-300 overflow-hidden ${
                      isHighlighted 
                        ? "ring-2 ring-[#F27F22] border-transparent shadow-lg shadow-orange-100 bg-orange-50/10" 
                        : "border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100">
                          Pending Review
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Oleh: @{recipe.user?.username || "user_foodie"}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-lg text-slate-800 line-clamp-1 flex-1">{recipe.title}</h3>
                          {/* TOMBOL LIHAT DETAIL UTUH */}
                          <button 
                            onClick={() => openPreviewModal(recipe)}
                            className="text-xs text-[#F27F22] hover:text-[#d96d1a] font-bold flex items-center gap-1 shrink-0 bg-orange-50 px-2 py-1 rounded-md border border-orange-100"
                          >
                            <Eye size={12} /> Detail Resep
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{recipe.description}</p>
                      </div>

                      {/* STATISTIK GIZI DAN DURASI SINGKAT */}
                      <div className="flex gap-4 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-500" />
                          <span>{recipe.cooking_time || 0} Menit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flame size={14} className="text-red-500" />
                          <span>{recipe.protein || 0}g Protein</span>
                        </div>
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

      {/* MODAL BARU: PREVIEW DETAIL INFORMASI RESEP UTUH */}
      {isPreviewModalOpen && selectedPreviewRecipe && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border my-8 flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h2 className="font-extrabold text-lg text-slate-800">Pratinjau Dokumen Konten</h2>
                <p className="text-[11px] text-slate-400">Diunggah oleh Kontributor: <span className="font-bold text-orange-600">@{selectedPreviewRecipe.user?.username || "user"}</span></p>
              </div>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Isi Konten Modal (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Gambar Utama */}
              {(selectedPreviewRecipe.image_url || selectedPreviewRecipe.photo_profile) && (
                <div className="w-full h-56 bg-slate-100 rounded-xl overflow-hidden border shadow-sm">
                  <img 
                    src={selectedPreviewRecipe.image_url || selectedPreviewRecipe.photo_profile} 
                    alt={selectedPreviewRecipe.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600"; }}
                  />
                </div>
              )}

              {/* Judul & Deskripsi */}
              <div className="space-y-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">{selectedPreviewRecipe.title}</h1>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">{selectedPreviewRecipe.description}</p>
              </div>

              {/* Rincian Komposisi Gizi Makro & Porsi Lengkap */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Scale size={14} className="text-blue-500" /> Informasi Gizi & Takaran Saji
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-orange-50/60 p-2.5 rounded-xl border text-center">
                    <p className="text-[10px] text-slate-400 font-medium">Waktu Masak</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">{selectedPreviewRecipe.cooking_time || 0} Menit</p>
                  </div>
                  <div className="bg-red-50/60 p-2.5 rounded-xl border text-center">
                    <p className="text-[10px] text-slate-400 font-medium">Protein</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">{selectedPreviewRecipe.protein || 0}g</p>
                  </div>
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border text-center">
                    <p className="text-[10px] text-slate-400 font-medium">Karbohidrat</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">{selectedPreviewRecipe.carbohydrates || 45}g</p>
                  </div>
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border text-center">
                    <p className="text-[10px] text-slate-400 font-medium">Lemak</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">{selectedPreviewRecipe.fat || 12}g</p>
                  </div>
                  <div className="bg-purple-50/60 p-2.5 rounded-xl border text-center col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 font-medium">Porsi</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">{selectedPreviewRecipe.portions || 2} Orang</p>
                  </div>
                </div>
              </div>

              {/* Bahan-Bahan Masakan */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers size={14} className="text-orange-500" /> Kebutuhan Komposisi Bahan
                </h4>
                <div className="bg-slate-50 border p-4 rounded-xl">
                  {Array.isArray(selectedPreviewRecipe.ingredients) && selectedPreviewRecipe.ingredients.length > 0 ? (
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5">
                      {selectedPreviewRecipe.ingredients.map((ing, index) => (
                        <li key={index}>{ing}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {typeof selectedPreviewRecipe.ingredients === 'string' 
                        ? selectedPreviewRecipe.ingredients 
                        : "• 250g Dada Ayam segar\n• 3 siung Bawang Merah\n• 5 buah Cabai Rawit pedas\n• 1 sendok teh Lada Bubuk\n• Garam & Penyedap secukupnya"}
                    </p>
                  )}
                </div>
              </div>

              {/* Langkah Instruksi Memasak */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-emerald-500" /> Instruksi / Langkah Pembuatan
                </h4>
                <div className="bg-slate-50 border p-4 rounded-xl">
                  {Array.isArray(selectedPreviewRecipe.instructions) && selectedPreviewRecipe.instructions.length > 0 ? (
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
                      {selectedPreviewRecipe.instructions.map((step, index) => (
                        <li key={index} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-xs text-slate-600 space-y-2 font-medium">
                      {typeof selectedPreviewRecipe.instructions === 'string' ? (
                        selectedPreviewRecipe.instructions
                      ) : (
                        <>
                          <p>1. Bersihkan dada ayam, potong dadu kecil lalu tiriskan.</p>
                          <p>2. Haluskan bumbu cabai, bawang merah, lada, dan kunyit hingga rata.</p>
                          <p>3. Tumis bumbu halus di wajan hingga wangi, masukkan potongan ayam.</p>
                          <p>4. Tambahkan sedikit air, garam, masak hingga bumbu meresap matang.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer Action Bar Di Dalam Modal Detail */}
            <div className="p-4 bg-slate-100 border-t flex gap-3 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openRejectModal(selectedPreviewRecipe.id)}
                className="flex-1 bg-white hover:bg-red-50 text-red-600 border-red-200 font-bold text-xs"
              >
                <X size={14} className="mr-1" /> Tolak Konten
              </Button>
              <Button
                size="sm"
                onClick={() => handleVerify(selectedPreviewRecipe.id, true)}
                className="flex-1 bg-[#F27F22] hover:bg-[#d96d1a] text-white font-bold text-xs"
              >
                <Check size={14} className="mr-1" /> Setujui & Terbitkan Resep
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* COMPONENT MODAL POPUP ALASAN PENOLAKAN KUSTOM */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border p-6 space-y-4">
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
                Kirim Penolakan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
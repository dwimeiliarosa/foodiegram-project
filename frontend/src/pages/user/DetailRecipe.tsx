'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios"; // Menggunakan instance axios yang sudah dibuat
import { ArrowLeft, Heart, Bookmark, Trash2, Clock, User } from "lucide-react";

const DetailRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk interaksi UI
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const isLikeRef = useRef(false);
  const token = localStorage.getItem("token");

  // Ambil data user login dari localStorage
  const userData = localStorage.getItem("user");
  const userParsed = userData ? JSON.parse(userData) : null;
  const currentUserId = userParsed?.id;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Ambil data detail resep DAN daftar following secara paralel
        const [resRecipe, resFollowingList] = await Promise.all([
          api.get(`/recipes/${id}`),
          api.get(`/recipes/following`).catch(() => ({ data: [] }))
        ]);

        const data = resRecipe.data;
        setRecipe(data);
        setIsLiked(data.is_liked || false);
        setIsSaved(data.is_saved || false);
        setLikesCount(data.likes_count || 0);

        // === LOGIKA VALIDASI STATUS FOLLOW ===
        if (resFollowingList.data && Array.isArray(resFollowingList.data)) {
          const alreadyFollowed = resFollowingList.data.some(
            (followItem: any) => Number(followItem.id) === Number(data.user_id)
          );
          setIsFollowing(alreadyFollowed);
        } else {
          setIsFollowing(data.is_following || false);
        }

      } catch (error: any) {
        console.error("Gagal ambil detail:", error);
        if (error.response?.status === 404) {
          alert("Resep tidak ditemukan");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, navigate]);

  // --- FUNGSI LIKE ---
  // --- 1. Update fungsi handleLike ---
// --- FUNGSI LIKE ---
  const handleLike = async () => {
    try {
      const response = await api.post(`/recipes/like`, { recipe_id: Number(id) });
      if (response.status === 200 || response.status === 201) {
        const newLikeStatus = !isLiked;
        isLikeRef.current = newLikeStatus;
        setIsLiked(newLikeStatus);
        setLikesCount(prev => newLikeStatus ? prev + 1 : prev - 1);
        
        // Update state resep agar sinkron
        setRecipe((prev: any) => ({ ...prev, is_liked: newLikeStatus }));
      }
    } catch (err: any) {
      console.error("Gagal update like:", err);
      if (err.response?.status === 401) alert("Silakan login terlebih dahulu");
    }
  };

  // --- FUNGSI SAVE ---
  // --- FUNGSI SAVE YANG DIPERBAIKI ---
  const handleSave = async () => {
  try {
    const response = await api.post("/recipes/save", { recipe_id: Number(id) });
    if (response.status === 200 || response.status === 201) {
      // Toggle state lokal
      setIsSaved(!isSaved);

      // PENTING: Update state resep dengan mempertahankan status Like yang ada sekarang
      setRecipe((prev: any) => ({ 
        ...prev, 
        is_saved: !isSaved,
        is_liked: isLiked // Pertahankan status like yang ada di state isLiked
      }));
    }
  } catch (error: any) {
    console.error("Gagal simpan resep:", error);
    alert("Gagal menyimpan resep");
  }
};

  const handleFollow = async () => {
    try {
      const response = await api.post("/recipes/follow", { 
        following_id: Number(recipe.user_id)
      });

      if (response.status === 200 || response.status === 201) {
        setIsFollowing(!isFollowing);
        alert(`Berhasil ${isFollowing ? 'berhenti mengikuti' : 'mengikuti'} @${recipe.username}`);
      }
    } catch (error: any) {
      console.error("Error DetailRecipe:", error.response?.data);
      alert(error.response?.data?.message || "Gagal mengikuti user");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus resep ini secara permanen?")) return;
    try {
      await api.delete(`/recipes/${id}`);
      alert("Resep berhasil dihapus!");
      navigate("/profile");
    } catch (error) {
      alert("Gagal menghapus resep.");
    }
  };

  // --- KONDISI DINAMIS UNTUK RENDERING MEDIA (VIDEO / GAMBAR) ---
  const renderRecipeMedia = () => {
    const MINIO_ENDPOINT = "http://localhost:9000";
    const BUCKET = "foodiegram";

    // 1. Jika bertipe reels atau field image_url kosong tetapi video_url ada, render VIDEO
    if ((recipe?.post_type === 'reels' || !recipe?.image_url) && recipe?.video_url) {
      let finalVideoUrl = recipe.video_url.replace("127.0.0.1", "localhost");
      
      if (!finalVideoUrl.startsWith("http")) {
        finalVideoUrl = `${MINIO_ENDPOINT}/${BUCKET}/videos/${finalVideoUrl}`;
      }

      return (
        <video 
          src={finalVideoUrl} 
          className="w-full h-full object-cover" 
          controls
          autoPlay
          muted
          playsInline
        />
      );
    }

    // 2. Jika bertipe photo atau default gambar biasa
    let path = recipe?.image_url;
    let finalImageUrl = "https://placehold.co/600x400?text=No+Image";

    if (path && path !== "" && path !== "[null]") {
      if (path.startsWith("http")) {
        finalImageUrl = path.replace("127.0.0.1", "localhost");
      } else {
        // Fallback jika backend mengirim file name lokal lama
        finalImageUrl = path.includes("uploads/") 
          ? `http://localhost:5000/${path}` 
          : `${MINIO_ENDPOINT}/${BUCKET}/recipes/${path}`;
      }
    }

    return (
      <img 
        src={finalImageUrl} 
        alt={recipe?.title} 
        className="w-full h-full object-cover" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=FoodieGram";
        }}
      />
    );
  };

  if (loading) return <div className="p-10 text-center text-orange-500 font-bold italic">Menyajikan data lezat...</div>;
  if (!recipe) return <div className="p-10 text-center">Resep tidak ditemukan.</div>;

  const isOwner = Number(recipe.user_id) === Number(currentUserId);

  return (
    <div className="min-h-screen bg-slate-50 md:p-8 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-gray-100">
        
        {/* Tombol Back */}
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 bg-white/90 p-3 rounded-full shadow-md hover:bg-orange-500 hover:text-white transition-all">
          <ArrowLeft size={24} />
        </button>

        {/* Bagian Media (Kiri / Atas) */}
        <div className="md:w-1/2 h-[400px] md:h-auto bg-slate-100 flex items-center justify-center overflow-hidden">
          {renderRecipeMedia()}
        </div>

        {/* Konten (Kanan / Bawah) */}
        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[100vh] md:max-h-[850px] bg-white">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4 items-center">
              <button onClick={handleLike} className={`p-3 rounded-full transition-all ${isLiked ? 'bg-red-50 text-red-500 shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button onClick={handleSave} className={`p-3 rounded-full transition-all ${isSaved ? 'bg-orange-50 text-orange-500 shadow-inner' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Bookmark size={28} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-lg">{likesCount}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Suka</span>
              </div>
            </div>

            {isOwner && (
              <button onClick={handleDelete} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-100">
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight">{recipe.title}</h1>
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <Link to={`/user/${recipe.user_id}`} className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-orange-500 group-hover:border-orange-500 transition-all">
                  <User size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Dibuat oleh</span>
                  <span className="font-bold text-slate-800 group-hover:text-orange-500">@{recipe.username || "Chef"}</span>
                </div>
              </Link>

              {!isOwner && (
                <button onClick={handleFollow} className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-md transition-all active:scale-90 ${isFollowing ? 'bg-gray-100 text-gray-800 border' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                  {isFollowing ? 'Mengikuti' : 'Ikuti'}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <Clock size={16} />
              <span>{recipe.cooking_time || "15"} Menit</span>
            </div>
          </div>

          {/* Nutrisi */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            <NutritionCard label="Protein" value={recipe.protein} color="blue" />
            <NutritionCard label="Karbo" value={recipe.carbo || recipe.carbs} color="orange" />
            <NutritionCard label="Lemak" value={recipe.fat} color="green" />
          </div>

          {/* Bahan & Langkah */}
          <div className="mb-10">
            <h3 className="text-xl font-black mb-4 flex items-center gap-3">
              <span className="w-2 h-8 bg-orange-500 rounded-full block"></span>
              Bahan-bahan
            </h3>
            <div className="text-slate-600 bg-orange-50/30 border border-orange-100/50 p-6 rounded-3xl italic whitespace-pre-line">
              {recipe.ingredients || "Bahan belum dicantumkan."}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-black mb-4 text-slate-900">Cara Memasak</h3>
            <div className="bg-slate-900 p-8 rounded-[35px] text-white shadow-xl shadow-slate-200">
              <p className="leading-relaxed opacity-90 whitespace-pre-line">
                {recipe.steps || recipe.instructions || "Langkah-langkah belum tersedia."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NutritionCard = ({ label, value, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100 text-blue-500",
    orange: "bg-orange-50 border-orange-100 text-orange-500",
    green: "bg-green-50 border-green-100 text-green-500"
  };
  return (
    <div className={`${colors[color]} p-4 rounded-3xl text-center border shadow-sm`}>
      <p className="text-[9px] uppercase tracking-widest font-black mb-1 opacity-70">{label}</p>
      <p className="text-xl font-black text-slate-800">{value || "0"}<span className="text-xs ml-0.5">g</span></p>
    </div>
  );
};

export default DetailRecipe;
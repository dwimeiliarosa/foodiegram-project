import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ArrowLeft, Heart, Bookmark, Trash2, MessageCircle, Clock, User } from "lucide-react";

const DetailRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // --- PERBAIKAN DI SINI (POINT 1) ---
  // Kita ambil object "user" lalu parse karena isinya adalah string JSON
  const userData = localStorage.getItem("user");
  const userParsed = userData ? JSON.parse(userData) : null;
  const currentUserId = userParsed?.id; 
  // -----------------------------------

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        const data = response.data;
        setRecipe(data);
        
        setIsLiked(data.is_liked || false);
        setIsSaved(data.is_saved || false);
        setLikesCount(data.likes_count || 0);
      } catch (error: any) {
        console.error("Gagal ambil detail:", error.response?.data || error.message);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleLike = async () => {
    try {
      const newStatus = !isLiked;
      setIsLiked(newStatus);
      setLikesCount(prev => newStatus ? prev + 1 : prev - 1);
      
      // Mengirim ke backend Dwi dengan format body recipe_id
      await api.post("/recipes/like", { recipe_id: id }); 
      
    } catch (error) {
      console.error("Gagal like:", error);
      setIsLiked(!isLiked); 
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      alert("Gagal menyimpan like. Cek apakah Dwi sudah buat endpoint /recipes/like");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      await api.post("/recipes/save", { recipe_id: id });
    } catch (error) {
      alert("Gagal menyimpan resep");
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

  if (!recipe) return <div className="p-10 text-center text-orange-500 font-bold">Memuat...</div>;

  // --- PERBAIKAN DI SINI (POINT 2) ---
  // Log untuk memastikan ID sudah muncul di console
  console.log("ID Pemilik Resep:", recipe.user_id);
  console.log("ID Saya (currentUserId):", currentUserId);

  // Bandingkan ID pemilik resep dengan ID user yang sedang login
  const isOwner = Number(recipe.user_id) === Number(currentUserId);

  return (
    <div className="min-h-screen bg-slate-50 md:p-8 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 bg-white/90 p-3 rounded-full shadow-md">
          <ArrowLeft size={24} />
        </button>

        {/* Gambar */}
        <div className="md:w-1/2 h-[500px] md:h-[750px] bg-slate-100">
          <img 
            src={recipe.image_url?.startsWith('http') ? recipe.image_url : `http://localhost:9000/foodiegram/recipes/${recipe.image_url}`} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Konten */}
        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[750px]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4 items-center">
              <button onClick={handleLike} className={`p-3 rounded-full ${isLiked ? 'bg-red-50 text-red-500' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button onClick={handleSave} className={`p-3 rounded-full ${isSaved ? 'bg-orange-50 text-orange-500' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <span className="font-bold text-slate-500">{likesCount} Likes</span>
            </div>

            {/* TOMBOL HAPUS AKAN MUNCUL DI SINI JIKA isOwner TRUE */}
            {isOwner ? (
              <button onClick={handleDelete} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg transition-all">
                <div className="flex items-center gap-2">
                  <Trash2 size={18} /> 
                </div>
              </button>
            ) : (
              <button onClick={handleSave} className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all ${isSaved ? 'bg-slate-800 text-white' : 'bg-orange-500 text-white'}`}>
                {isSaved ? "Tersimpan" : "Simpan"}
              </button>
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{recipe.title}</h1>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <User size={18} className="text-orange-500" />
              <span>@{recipe.username || "user"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Clock size={18} className="text-orange-500" />
              <span>{recipe.cooking_time || recipe.time || "20-30"} menit</span>
            </div>
            <span className="text-slate-400 text-sm">{recipe.views_count || 0} kali dilihat</span>
          </div>

          {/* Nutrisi Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Protein</p>
              <p className="text-lg font-black text-gray-800">{recipe.protein || "0"}g</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-100">
              <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-1">Karbo</p>
              <p className="text-lg font-black text-gray-800">{recipe.carbo || recipe.carbs || "0"}g</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Lemak</p>
              <p className="text-lg font-black text-gray-800">{recipe.fat || recipe.lemak || "0"}g</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageCircle className="text-orange-500"/> Bahan</h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
              {recipe.ingredients}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Cara Memasak</h3>
            <div className="bg-orange-50 p-6 rounded-[24px] border border-orange-100">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {recipe.steps || recipe.instructions || recipe.description || "Instruksi belum tersedia."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailRecipe;
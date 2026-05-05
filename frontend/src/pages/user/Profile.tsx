import { useState, useEffect } from "react";
import { Settings, Plus, Grid, Bookmark, Heart, X } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("resep");
  
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null); 
  const token = localStorage.getItem("authToken") || localStorage.getItem("authtoken");

  // --- 1. AMBIL DATA PROFIL & STATS ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const resProfile = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataProfile = await resProfile.json();
        setUser(dataProfile);

        const resFollowers = await fetch("http://localhost:5000/api/recipes/followers", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resFollowing = await fetch("http://localhost:5000/api/recipes/following", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const followersData = await resFollowers.json();
        const followingData = await resFollowing.json();

        setStats(prev => ({
          ...prev,
          followers: followersData.length || 0,
          following: followingData.length || 0
        }));
      } catch (err) {
        console.error("Gagal load profil:", err);
      }
    };
    fetchProfileData();
  }, [token]);

  // --- 2. AMBIL KONTEN BERDASARKAN TAB ---
  useEffect(() => {
    const fetchTabContent = async () => {
      setLoading(true);
      let endpoint = "/api/recipes/my-recipes";
      if (activeTab === "disimpan") endpoint = "/api/recipes/saved";
      if (activeTab === "disukai") endpoint = "/api/recipes/liked-recipes";

      try {
        const res = await fetch(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const finalData = data.recipes || (Array.isArray(data) ? data : []);
        setContent(finalData);
        
        if (activeTab === "resep") {
          setStats(prev => ({ ...prev, posts: finalData.length }));
        }
      } catch (err) {
        console.error("Gagal load konten:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTabContent();
  }, [activeTab, token]);

  const getFormattedImageUrl = (url: string) => {
    if (!url) return "https://placehold.co/400x400?text=No+Image";
    return url.replace("127.0.0.1", "localhost");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="p-4 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo-foodiegram.png" alt="Logo" className="h-8" />
          <span className="text-orange-500 font-bold text-xl italic">FoodieGram</span>
        </div>
        <button onClick={() => navigate("/settings")} className="p-2">
          <Settings size={28} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start border-b pb-8">
          <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
            <div className="w-24 h-24 bg-gray-200 rounded-full border-2 border-orange-500 overflow-hidden">
               <img 
                src={getFormattedImageUrl(user?.photo_url || "/avatar.png")} 
                className="w-full h-full object-cover" 
                alt="Profile"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{user?.username || "Wanda"}</h2>
              <p className="text-gray-500 italic mt-1">{user?.bio || "Bio belum diatur"}</p>
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate("/edit-profile")} className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-semibold">
                  Edit Profil
                </button>
                <button onClick={() => navigate("/upload")} className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
                  <Plus size={16} /> Add Posting
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-around w-full md:w-2/3 py-4 md:py-0 border-t md:border-t-0 md:border-l border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.posts}</div>
              <div className="text-gray-500 text-sm">Post</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.followers}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.following}</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="mt-8">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab("resep")} className={`pb-3 flex-1 flex justify-center ${activeTab === "resep" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-400"}`}>
              <Grid size={24} />
            </button>
            <button onClick={() => setActiveTab("disimpan")} className={`pb-3 flex-1 flex justify-center ${activeTab === "disimpan" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-400"}`}>
              <Bookmark size={24} />
            </button>
            <button onClick={() => setActiveTab("disukai")} className={`pb-3 flex-1 flex justify-center ${activeTab === "disukai" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-400"}`}>
              <Heart size={24} />
            </button>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6">
            {loading ? (
              <div className="col-span-3 text-center py-10 animate-pulse text-gray-400">Memuat konten...</div>
            ) : content.length > 0 ? (
              content.map((item, index) => (
              <div 
                key={index} 
                onClick={() => navigate(`/recipe/${item.id}`)} // LANGSUNG ARAHKAN KE DETAIL
                className="aspect-square rounded-lg md:rounded-2xl overflow-hidden bg-gray-100 border shadow-sm cursor-pointer group relative"
              >
                <img 
                  src={getFormattedImageUrl(item.image_url)} 
                  className="w-full h-full object-cover group-hover:brightness-90 transition-all" 
                  alt="resep" 
                />
              </div>
            ))
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-400">Belum ada konten.</div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL DETAIL RESEP (SAMA DENGAN BERANDA) --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-10">
          <button 
            onClick={() => setSelectedPost(null)}
            className="absolute top-4 right-4 text-white z-[2001] bg-black/20 rounded-full p-1 hover:text-orange-500 transition-colors"
          >
            <X size={30} />
          </button>

          {/* Container Utama: Perhatikan md:flex-row */}
          <div className="bg-white w-full max-w-lg md:max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-3xl shadow-2xl flex flex-col md:flex-row custom-scrollbar">
            
            {/* Bagian Kiri: Gambar Resep */}
            <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <img 
                src={getFormattedImageUrl(selectedPost.image_url)} 
                className="w-full h-full object-cover min-h-[300px] md:min-h-[500px]"
                alt={selectedPost.title}
              />
            </div>

            {/* Bagian Kanan: Detail Resep */}
            <div className="w-full md:w-1/2 flex flex-col bg-white p-6 md:p-10 overflow-y-auto">
              
              {/* Header: Actions */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 text-gray-600">
                  <Heart size={24} className="cursor-pointer hover:text-red-500 transition-colors" />
                  <Bookmark size={24} className="cursor-pointer hover:text-orange-500 transition-colors" />
                </div>
                <button className="bg-orange-500 text-white px-8 py-2 rounded-full font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
                  Simpan
                </button>
              </div>

              {/* Judul & Info User */}
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{selectedPost.title || "Nama Resep"}</h1>
              <p className="text-gray-400 text-sm mb-6">42 kali dilihat</p>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs overflow-hidden">
                   <img 
                    src={getFormattedImageUrl(user?.photo_url || "/avatar.png")} 
                    className="w-full h-full object-cover" 
                    alt="avatar"
                  />
                </div>
                <span className="font-bold text-gray-700">@{user?.username || "user"}</span>
              </div>

              {/* Nutrisi Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Protein</p>
                  <p className="text-lg font-black text-gray-800">{selectedPost.protein || "0"}g</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-100">
                  <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-1">Karbo</p>
                  <p className="text-lg font-black text-gray-800">{selectedPost.carbo || "0"}g</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Lemak</p>
                  <p className="text-lg font-black text-gray-800">{selectedPost.fat || "0"}g</p>
                </div>
              </div>

              {/* Bahan-bahan */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <h3 className="font-bold text-xl text-gray-900">Bahan-bahan</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-4 border-l-2 border-orange-100">
                  {selectedPost.ingredients || "Belum ada data bahan."}
                </p>
              </div>

              {/* Instruksi */}
              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-900 mb-4">Instruksi Memasak</h3>
                <div className="bg-gray-50 p-6 rounded-3xl text-gray-600 leading-relaxed italic">
                  {selectedPost.instructions || "Belum ada instruksi memasak."}
                </div>
              </div>
 
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
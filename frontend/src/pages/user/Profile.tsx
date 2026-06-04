import { useState, useEffect,useRef } from "react";
import { Settings, Plus, Grid, Bookmark, Heart, X } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

const HoverVideo = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      // Memutar video secara aman lewat jembatan useRef, menangkap error blokir browser
      videoRef.current.play().catch((err) => console.log("Autoplay ditangguhkan browser:", err));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Mengembalikan video ke detik awal saat kursor keluar
    }
  };

  return (
    <div 
      className="w-full h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-cover"
        muted 
        loop 
        playsInline
        preload="metadata"
      />
      <div className="absolute top-1.5 right-1.5 bg-black/50 text-white px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider">
        REELS
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  // State untuk Tab Aktif
  const [activeTab, setActiveTab] = useState("resep"); // resep | disimpan | disukai
  
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

        // Ambil Followers & Following untuk angka stats
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
          followers: Array.isArray(followersData) ? followersData.length : 0,
          following: Array.isArray(followingData) ? followingData.length : 0
        }));
      } catch (err) {
        console.error("Gagal load profil:", err);
      }
    };
    if (token) fetchProfileData();
  }, [token]);

  // --- 2. AMBIL KONTEN BERDASARKAN TAB (LOGIKA DARI DWI) ---
  // --- 2. AMBIL KONTEN BERDASARKAN TAB (LOGIKA FILTERING) ---
  useEffect(() => {
    const fetchTabContent = async () => {
      setLoading(true);
      
      // Tentukan endpoint dasar
      let endpoint = "/api/recipes/my-recipes";
      if (activeTab === "disimpan" || activeTab === "disukai") {
        endpoint = "/api/recipes/saved"; 
      }

      try {
        const res = await fetch(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Gagal ambil data");

        const data = await res.json();
        const allData = data.recipes || (Array.isArray(data) ? data : []);

        // --- DISINI LOGIKA FILTER YANG SAYA SARANKAN ---
        // Kita gunakan == (dua sama dengan) supaya 1 (number) dianggap sama dengan "1" (string)
        let filteredData = allData;

        if (activeTab === "disimpan") {
          filteredData = allData.filter((item: any) => 
            item.is_saved == 1 || item.is_saved == true
          );
        } else if (activeTab === "disukai") {
          filteredData = allData.filter((item: any) => 
            item.is_liked == 1 || item.is_liked == true
          );
        }

        setContent(filteredData);
        
        if (activeTab === "resep") {
          setStats(prev => ({ ...prev, posts: allData.length }));
        }
      } catch (err) {
        console.error("Gagal load konten:", err);
        setContent([]); 
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchTabContent();
  }, [activeTab, token]);

  const getFormattedImageUrl = (url: string) => {
    if (!url) return "https://placehold.co/400x400?text=No+Image";
    
    // Jika URL mengandung 127.0.0.1, ganti ke localhost agar tidak kena blokir browser
    let finalUrl = url.replace("127.0.0.1", "localhost");

    // Jika URL sudah full (http), langsung pakai
    if (finalUrl.startsWith("http")) return finalUrl;

    // Jika hanya nama file, arahkan ke folder uploads backend
    return `http://localhost:5000/uploads/${finalUrl}`; 
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="p-4 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-orange-500 font-bold text-xl italic">FoodieGram</span>
        </div>
        <button onClick={() => navigate("/settings")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings size={28} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b pb-8">
          <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
            <div className="w-28 h-28 bg-gray-200 rounded-full border-4 border-orange-500 overflow-hidden shadow-lg">
                <img 
                  src={getFormattedImageUrl(user?.photo_profile)} // Sesuai field dari Swagger
                  className="w-full h-full object-cover" 
                  alt="Profile"
                  onError={(e) => {
                    // Fallback jika gambar gagal load
                    (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Error+Load";
                  }}
                />
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-gray-800">{user?.username || "Wanda"}</h2>
              <p className="text-gray-500 mt-1">{user?.bio || "Halo! Saya suka memasak 🍳"}</p>
              
              <div className="flex justify-center md:justify-start gap-4 mt-6">
                <div className="text-center">
                  <div className="text-xl font-bold">{stats.posts}</div>
                  <div className="text-gray-400 text-xs uppercase font-bold">Post</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{stats.followers}</div>
                  <div className="text-gray-400 text-xs uppercase font-bold">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{stats.following}</div>
                  <div className="text-gray-400 text-xs uppercase font-bold">Following</div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 justify-center md:justify-start">
                <button onClick={() => navigate("/edit-profile")} className="px-6 py-2 bg-gray-100 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
                  Edit Profil
                </button>
                <button onClick={() => navigate("/upload")} className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-600 shadow-md transition-all">
                  <Plus size={18} /> Posting Resep
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="mt-4">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab("resep")} 
              className={`pb-4 flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === "resep" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Grid size={22} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Resep</span>
            </button>
            <button 
              onClick={() => setActiveTab("disimpan")} 
              className={`pb-4 flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === "disimpan" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Bookmark size={22} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Disimpan</span>
            </button>
            <button 
              onClick={() => setActiveTab("disukai")} 
              className={`pb-4 flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === "disukai" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Heart size={22} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Disukai</span>
            </button>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-3 gap-1 md:gap-2 mt-4">
            {loading ? (
              <div className="col-span-3 text-center py-20 text-gray-400 font-medium animate-pulse">Sedang memuat {activeTab}...</div>
            ) : content.length > 0 ? (
              content.map((item, index) => (
                <div 
                  key={item.id || index} 
                  onClick={() => navigate(`/recipe/${item.id}`)} 
                  className="aspect-square bg-slate-100 overflow-hidden cursor-pointer group relative active:scale-95 transition-all rounded-lg"
                >
                  {/* LOGIKA FIX: Jika image_url null DAN tipe konten adalah reels/video, putar video pendek */}
                  {(item.post_type === 'reels' || !item.image_url) && item.video_url ? (
                    <div className="w-full h-full relative">
                      <video 
                        src={item.video_url.replace("127.0.0.1", "localhost")} 
                        className="w-full h-full object-cover"
                        muted 
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                      <div className="absolute top-1.5 right-1.5 bg-black/50 text-white px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider">
                        REELS
                      </div>
                    </div>
                  ) : (
                    /* Jika resep gambar biasa (photo), tampilkan tag img seperti biasa */
                    <img 
                      src={getFormattedImageUrl(item.image_url)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt="resep" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=FoodieGram";
                      }}
                    />
                  )}
                  {/* Overlay tipis saat hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                </div>
              ))
              // === POTONGAN KODE BARU SELESAI DI SINI ===

            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                   {activeTab === "disimpan" ? <Bookmark size={40} /> : <Grid size={40} />}
                </div>
                <p className="font-bold text-gray-500 text-sm">Belum ada {activeTab}</p>
                <p className="text-xs">Eksplor resep lezat lainnya!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
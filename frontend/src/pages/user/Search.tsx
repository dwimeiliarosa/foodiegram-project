import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { Search as SearchIcon, Filter, Home, PlusSquare, Bell, User } from "lucide-react"; // 👈 Icon Camera dicopot

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]); // 👈 State selectedImage dibuang
  const [loading, setLoading] = useState(false);

  const myFridgeIngredients = ["Cabai", "Lada", "Kunyit", "Bawang Merah", "Ayam", "Telur"];
  const token = localStorage.getItem("authToken") || localStorage.getItem("authtoken");

  // Efek untuk menyinkronkan array ingredients ke teks input
  useEffect(() => {
    const text = ingredients.join(", ");
    setInputValue(text);
  }, [ingredients]);

  // Logika Fetch Data Awal
  useEffect(() => {
    const fetchPopularRecipes = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/recipes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setRecipes(data.recipes || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Gagal memuat resep:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularRecipes();
  }, [token]);

  const toggleFridgeIngredient = (item: string) => {
    const newIngredients = ingredients.includes(item)
      ? ingredients.filter((i) => i !== item)
      : [...ingredients, item];

    setIngredients(newIngredients);
    setInputValue(newIngredients.join(", ")); 
    handleSearch(newIngredients); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value.endsWith(" ") && !value.endsWith(",")) {
      const newIngredients = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      setIngredients(newIngredients);
      handleSearch(newIngredients);
    }
  };

  const handleSearch = async (currentIngredients?: string[]) => {
    const ingredientsToSearch = currentIngredients || ingredients;

    if (ingredientsToSearch.length === 0) return;

    setLoading(true);
    const itemsParam = ingredientsToSearch.join(",");

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/search-ingredients?items=${encodeURIComponent(itemsParam)}`, 
        {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error Server (${response.status}):`, errorText);
        return;
      }

      const data = await response.json();
      const rawRecipes = data.recipes || (Array.isArray(data) ? data : []);

      const filteredRecipes = rawRecipes.filter((recipe: any) => {
        const recipeIngredients = recipe.ingredients || [];
        return ingredientsToSearch.every((searchItem) => 
          recipeIngredients.some((recipeItem: string) => 
            recipeItem.toLowerCase().includes(searchItem.toLowerCase())
          )
        );
      });

      setRecipes(filteredRecipes);

    } catch (error) {
      console.error("Pencarian gagal di sisi Client:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path ? "text-orange-500" : "text-slate-400";

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <div className="max-w-md mx-auto p-4">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-foodiegram.png" alt="FoodieGram" className="w-36 h-auto mb-4" />
          <div className="w-full flex justify-end">
            <button className="flex items-center gap-1 text-slate-500 font-bold text-sm">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Cari Resep Dari Kulkas"
              
              className="w-full bg-white border-2 border-orange-400 rounded-full py-2.5 pl-11 pr-4 focus:outline-none text-sm font-semibold shadow-sm"
            />
            {/* 🔴 Bagian <label> Kamera dan <input type="file"> lama sudah dihapus dari sini */}
          </div>
          <button 
            onClick={() => handleSearch()} 
            className="bg-orange-500 text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            Cari
          </button>
        </div>

        {/* --- DAFTAR BAHAN KULKAS --- */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Daftar Bahan Kulkas Saya</h3>
          <div className="flex flex-wrap gap-2">
            {myFridgeIngredients.map((item, index) => (
              <button
                key={index}
                onClick={() => toggleFridgeIngredient(item)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  ingredients.includes(item)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-orange-100 text-orange-600 border-orange-200" 
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* --- TOMBOL INSPIRASI --- */}
        <div className="mb-8">
            <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow-sm">
                Inspirasi Resep Kulkas
            </button>
        </div>

        {/* --- HASIL RESEP --- */}
        {loading ? (
          <div className="text-center py-10 animate-pulse text-slate-400 text-sm italic">Mencari resep...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm italic">Yah, bahan kamu belum ada resepnya.</p>
            <p className="text-orange-500 font-bold text-sm cursor-pointer hover:underline" onClick={() => setIngredients([])}>Coba bahan lain?</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
  {recipes.map((recipe, index) => {
    
    // 1. AMBIL URL MEDIA SECARA FLEKSIBEL
    // Jika ada video_url, bersihkan ip 127.0.0.1 menjadi localhost
    const videoSrc = recipe.video_url ? recipe.video_url.replace("127.0.0.1", "localhost") : null;
    
    // Ambil gambar cover (jika ada), jika tidak ada arahkan ke default image mentah MinIO atau placeholder
    let imgSrc = recipe.image_url ? recipe.image_url.replace("127.0.0.1", "localhost") : null;
    
    if (!imgSrc && (!videoSrc)) {
      imgSrc = "https://placehold.co/500x500?text=No+Image";
    }

    return (
      <div 
        key={recipe.id || index} 
        onClick={() => navigate(`/recipe/${recipe.id}`)}
        className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 aspect-square bg-slate-900"
      >
        
        {/* 2. KONDISI RENDER: JIKA VIDEO (REELS), PAKAI TAG <video> */}
        {recipe.post_type === 'reels' && videoSrc ? (
          <video 
            src={videoSrc}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          /* JIKA FOTO BIASA, TETAP PAKAI TAG <img> */
          <img 
            src={imgSrc || "https://placehold.co/500x500?text=No+Image"} 
            className="w-full h-full object-cover" 
            alt={recipe.title} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&auto=format&fit=crop&q=60";
            }}
          />
        )}
        
        {/* GRADASI HITAM AGAR TEKS TETAP TERBACA */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* JUDUL RESEP */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 pointer-events-none">
          <p className="text-white text-xs font-bold truncate drop-shadow-md mb-6">
            {recipe.title}
          </p>
        </div>

        {/* BADGE MATCH */}
        <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold z-20 shadow-sm">
            Match 3/5
        </div>
      </div>
    );
  })}
</div>
        )}
      </div>

      {/* --- NAVBAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-5 flex justify-between items-center z-50">
        <Home className={isActive('/')} size={28} onClick={() => navigate("/")} />
        <SearchIcon className={isActive('/search')} size={28} onClick={() => navigate("/search")} />
        <PlusSquare className={isActive('/upload')} size={28} onClick={() => navigate("/upload")} />
        <Bell className={isActive('/notifications')} size={28} onClick={() => navigate("/notifications")} />
        <User className={isActive('/profile')} size={28} onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};

export default Search;
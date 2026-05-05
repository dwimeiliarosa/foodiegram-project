import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { Search as SearchIcon, Camera, X, Filter, Home, PlusSquare, Bell, User } from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const myFridgeIngredients = ["Cabai", "Lada", "Kunyit", "Bawang Merah", "Ayam", "Telur"];
  const token = localStorage.getItem("authToken") || localStorage.getItem("authtoken");

  // Efek untuk menyinkronkan array ingredients ke teks input (Format: "bahan1, bahan2, ")
    useEffect(() => {
  // Setiap kali array ingredients berubah (diklik atau dihapus), 
  // teks di kolom input akan otomatis terupdate.
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

// 1. Perbaiki Logika Klik: Kirim data terbaru langsung ke pencarian
const toggleFridgeIngredient = (item: string) => {
  const newIngredients = ingredients.includes(item)
    ? ingredients.filter((i) => i !== item)
    : [...ingredients, item];

  setIngredients(newIngredients);
  
  // PERBAIKAN: Perbarui teks di kolom input agar sinkron dengan tombol yang diklik
  setInputValue(newIngredients.join(", ")); 
  
  handleSearch(newIngredients); 
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setInputValue(value); // Biarkan user mengetik apapun, termasuk spasi

  // Hanya update ingredients jika karakter terakhir bukan spasi/koma
  // Ini agar user bisa mengetik "Ayam Goreng" tanpa terpotong
  if (!value.endsWith(" ") && !value.endsWith(",")) {
    const newIngredients = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    setIngredients(newIngredients);
    // Jalankan pencarian
    handleSearch(newIngredients);
  }
};
// 2. Perbaiki Handler Search: Terima parameter agar data sinkron
const handleSearch = async (currentIngredients?: string[]) => {
  const ingredientsToSearch = currentIngredients || ingredients;

  // Jika tidak ada bahan, jangan kirim request
  if (ingredientsToSearch.length === 0) return;

  setLoading(true);

  // 1. Gabungkan array menjadi string dipisahkan koma sesuai deskripsi Swagger
  const itemsParam = ingredientsToSearch.join(",");

  try {
    // 2. Gunakan metode GET dan masukkan parameter ke URL (?items=...)
    const response = await fetch(
      `http://localhost:5000/api/recipes/search-ingredients?items=${encodeURIComponent(itemsParam)}`, 
      {
        method: "GET", // Sesuai Swagger
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

// FILTER TAMBAHAN: Pastikan SEMUA bahan yang dicari ada di dalam resep tersebut
const filteredRecipes = rawRecipes.filter((recipe: any) => {
  // Ambil array ingredients dari database (ingat kolom kamu bertipe text[])
  const recipeIngredients = recipe.ingredients || [];
  
  // Cek apakah SETIAP (every) bahan yang dicari Wanda ada di resep ini
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

// 3. Hapus useEffect yang memantau [ingredients] agar tidak terjadi double-fetch
// Karena pencarian sudah dipicu langsung di dalam toggleFridgeIngredient

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
              className="w-full bg-white border-2 border-orange-400 rounded-full py-2.5 pl-11 pr-12 focus:outline-none text-sm font-semibold shadow-sm"
            />
            <label htmlFor="cam" className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
              <Camera size={20} className="text-slate-700" />
            </label>
            <input type="file" id="cam" hidden onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
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
                    : "bg-orange-500 text-white border-orange-500" // Sesuai SS kamu, semua tombol berwarna oranye
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
            {recipes.map((recipe, index) => (
              <div key={recipe.id || index} className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <img 
                  src={recipe.image_url?.replace("127.0.0.1", "localhost")} 
                  className="w-full aspect-square object-cover" 
                  alt={recipe.title} 
                />
                <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                    Match 3/5
                </div>
              </div>
            ))}
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
import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Recipe } from "../../types/recipe";
import RecipeCard from "../../components/user/RecipeCard";
import { Search, Filter, X } from "lucide-react";

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<any[]>([]); 
  const [activeCategoryID, setActiveCategoryID] = useState<number | string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Ambil List Kategori saat pertama kali halaman dimuat
  useEffect(() => {
    api.get("/recipes/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Gagal muat kategori:", err));
  }, []);

  // 2. Fungsi Fetch Data yang sinkron dengan fungsi backend getAllRecipes
  const fetchRecipes = async (categoryId: number | string, query: string) => {
    try {
      // SINKRONISASI: Gunakan endpoint utama agar mendapatkan data resep ter-approved secara lengkap
      let url = "/recipes";
      const params = new URLSearchParams();
      
      if (query.trim()) params.append("title", query);
      if (categoryId !== "Semua") params.append("category_id", categoryId.toString());

      const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

      const res = await api.get(finalUrl);
      
      // Mengambil data berbentuk array langsung dari res.data (sesuai output getAllRecipes)
      const dataArray = Array.isArray(res.data) ? res.data : (res.data.recipes || []);
      
      // Urutkan berdasarkan tanggal terbaru (atau views_count sesuai kenyamanan UX kamu)
      const sortedData = [...dataArray].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      setRecipes(sortedData);
      
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]);
    }
  };

  // 3. Hanya trigger fetch otomatis saat Kategori diubah
  useEffect(() => {
    fetchRecipes(activeCategoryID, searchQuery);
  }, [activeCategoryID]);

  // 4. Jalankan fetch saat tombol Search ditekan (mencegah lag ketikan)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes(activeCategoryID, searchQuery);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER: Logo, Search, Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex-shrink-0">
          <img 
            src="/assets/logo-foodiegram.jpeg" 
            alt="FoodieGram Logo"
            className="h-12 md:h-16 w-auto object-contain" 
          />
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl w-full group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Resep..." 
            className="w-full pl-6 pr-24 py-3.5 bg-[#F17228]/10 rounded-full focus:ring-2 focus:ring-orange-400 outline-none placeholder:text-slate-500 font-medium text-lg transition-all"
          />

          {/* KONTROL DI SEBELAH KANAN */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Tombol X (Clear) */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(""); 
                  fetchRecipes(activeCategoryID, ""); 
                }}
                className="p-2 hover:bg-orange-200 rounded-full text-slate-500 hover:text-orange-600 transition-all"
              >
                <X size={18} strokeWidth={3} />
              </button>
            )}

            {/* Tombol Search Utama */}
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full shadow-md shadow-orange-200 transition-all active:scale-90"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        <button className="flex items-center gap-2 font-bold text-slate-700 hover:text-orange-500 transition-colors">
          <Filter className="w-7 h-7 stroke-[1.5px]" />
          <span className="hidden md:inline text-xl">Filter</span>
        </button>
      </div>

      {/* TABS KATEGORI */}
      <div className="flex overflow-x-auto gap-4 mb-8 pb-2 no-scrollbar">
        <button
          onClick={() => {
            setActiveCategoryID("Semua");
            fetchRecipes("Semua", searchQuery);
          }}
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm ${
            activeCategoryID === "Semua" 
              ? "bg-orange-500 text-white shadow-orange-200" 
              : "bg-white text-gray-600 hover:bg-orange-50"
          }`}
        >
          Semua
        </button>

        {/* Tombol Dinamis mengirim cat.id */}
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => {
              setActiveCategoryID(cat.id);
              fetchRecipes(cat.id, searchQuery);
            }}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeCategoryID === cat.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid Resep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-400 text-lg italic">Tidak ada resep ditemukan di kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
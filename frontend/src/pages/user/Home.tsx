import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Recipe } from "../../types/recipe";
import RecipeCard from "../../components/user/RecipeCard";
import { Search, Filter } from "lucide-react";

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // State kategori
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Ambil Kategori dari Backend
    api.get("/recipes/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Gagal muat kategori:", err));

    // 2. Ambil Resep Trending/Awal
    fetchRecipes();
  }, []);

  const fetchRecipes = async (category = "Semua", query = "") => {
    try {
      // Menyesuaikan dengan filter yang ada di backend Dwi
      let url = "/recipes/trending";
      if (category !== "Semua") url = `/recipes?category=${category}`;
      if (query) url = `/recipes?search=${query}`;

      const res = await api.get(url);
      setRecipes(res.data.recipes || res.data); // Pastikan mengambil array
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes(activeCategory, searchQuery);
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

        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Resep..." 
            className="w-full pl-14 pr-6 py-3.5 bg-[#F17228]/10 rounded-full focus:ring-2 focus:ring-orange-400 outline-none placeholder:text-slate-500 font-medium text-lg"
          />
        </form>

        <button className="flex items-center gap-2 font-bold text-slate-700 hover:text-orange-500 transition-colors">
          <Filter className="w-7 h-7 stroke-[1.5px]" />
          <span className="hidden md:inline text-xl">Filter</span>
        </button>
      </div>

      {/* TABS KATEGORI (Dinamis dari Backend) */}
      <div className="flex overflow-x-auto gap-4 mb-8 pb-2 no-scrollbar">
        <button 
          onClick={() => { setActiveCategory("Semua"); fetchRecipes("Semua"); }}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeCategory === "Semua" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => { setActiveCategory(cat.name); fetchRecipes(cat.name); }}
            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${activeCategory === cat.name ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}
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
          <p className="col-span-full text-center text-gray-400 py-10">Tidak ada resep ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
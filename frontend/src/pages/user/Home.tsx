import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Recipe } from "../../types/recipe";
import RecipeCard from "../../components/user/RecipeCard";
import { Search, Filter } from "lucide-react";

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    api.get("/recipes/trending") 
      .then((res) => setRecipes(res.data))
      .catch((err) => console.error("Error fetching recipes:", err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER: Logo, Search, Filter (Sesuai Desain) */}
      <div className="flex items-center justify-between gap-4 md:gap-8 mb-10">
        {/* Logo FoodieGram */}
        <div className="flex-shrink-0">
          <img 
            src="/assets/logo-foodiegram.jpeg" 
            alt="FoodieGram Logo"
            className="h-12 md:h-16 w-auto object-contain" 
          />
        </div>

        {/* Search Bar Oval */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari Resep" 
            className="w-full pl-14 pr-6 py-3.5 bg-[#F17228]/10 border border-[#F17228]/20 border-none rounded-full focus:ring-2 focus:ring-orange-400 outline-none placeholder:text-slate-500 font-medium text-lg"
          />
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-2 font-bold text-slate-700 hover:text-orange-500 transition-colors">
          <Filter className="w-7 h-7 stroke-[1.5px]" />
          <span className="hidden md:inline text-xl">Filter</span>
        </button>
      </div>

      {/* Grid Resep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Home;
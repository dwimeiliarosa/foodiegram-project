import { Link } from "react-router-dom";
import { useState } from "react"; // Tambahkan useState
import type { Recipe } from "../../types/recipe";
import { Heart, Bookmark } from "lucide-react";
import api from "../../api/axios"; // Import api axios kamu

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const MINIO_BASE_URL = "http://127.0.0.1:9000/foodiegram/recipes/";

  // --- 1. STATE LOKAL UNTUK INTERAKSI ---
  const [isLiked, setIsLiked] = useState(recipe.is_liked || false);
  const [isSaved, setIsSaved] = useState(recipe.is_saved || false);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path || path === "[null]" || path === "" || path === "null") {
      return "/assets/no-image.png"; 
    }
    if (path.startsWith("http")) {
      return path;
    }
    return `${MINIO_BASE_URL}${path.trim()}`;
  };

  // --- 2. HANDLER LIKE ---
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah Link aktif saat klik tombol
    try {
      setIsLiked(!isLiked);
      // Sesuai Swagger Dwi: POST ke /like dengan body recipe_id
      await api.post("/recipes/like", { recipe_id: recipe.id });
    } catch (error) {
      setIsLiked(isLiked); // Balikkan jika gagal
      console.error("Like error:", error);
    }
  };

  // --- 3. HANDLER SAVE ---
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsSaved(!isSaved);
      // Sesuai Swagger Dwi: POST ke /save dengan body recipe_id
      await api.post("/recipes/save", { recipe_id: recipe.id });
    } catch (error) {
      setIsSaved(isSaved);
      console.error("Save error:", error);
    }
  };

  return (
    <div className="flex flex-col group w-full">
      <Link to={`/recipe/${recipe.id}`} className="cursor-pointer">
        <div className="aspect-square rounded-[32px] overflow-hidden bg-slate-100 relative mb-2 shadow-sm border border-slate-200">
          {recipe.image_url && recipe.image_url !== "[null]" ? (
            <img 
              src={getImageUrl(recipe.image_url)} 
              alt={recipe.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=Check+MinIO+Policy";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm italic bg-slate-50">
              No Image Available
            </div>
          )}
        </div>
      </Link>

      <div className="flex justify-between items-center px-1 mb-1">
        {/* TOMBOL LIKE DENGAN LOGIKA */}
        <button 
          onClick={handleLike}
          className={`hover:scale-110 transition-all duration-200 ${isLiked ? 'text-red-500' : 'text-slate-800'}`}
        >
          <Heart className={`w-6 h-6 stroke-[2px] ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* TOMBOL SAVE DENGAN LOGIKA */}
        <button 
          onClick={handleSave}
          className={`hover:scale-110 transition-all duration-200 ${isSaved ? 'text-orange-500' : 'text-slate-800'}`}
        >
          <Bookmark className={`w-6 h-6 stroke-[2px] ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <Link to={`/recipe/${recipe.id}`} className="px-1 cursor-pointer">
        <h3 className="font-bold text-slate-900 text-lg md:text-xl line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {recipe.protein}g Protein • {recipe.views_count || 0} Views
        </p>
      </Link>
    </div>
  );
};

export default RecipeCard;
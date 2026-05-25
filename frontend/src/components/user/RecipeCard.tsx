import { Link } from "react-router-dom";
import { useState, useEffect } from "react"; 
import type { Recipe } from "../../types/recipe";
import { Heart, Bookmark, User } from "lucide-react";
import api from "../../api/axios"; 

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const BASE_URL_IMAGE = "http://localhost:5000/uploads/";

  const [isLiked, setIsLiked] = useState(recipe.is_liked || false);
  const [isSaved, setIsSaved] = useState(recipe.is_saved || false);

  // SINKRONISASI STATE: Update state lokal kartu jika ada pembaruan data re-fetch dari komponen induk
  useEffect(() => {
    setIsLiked(!!recipe.is_liked);
    setIsSaved(!!recipe.is_saved);
  }, [recipe.is_liked, recipe.is_saved]);

  const getImageUrl = (path: string | null) => {
    if (!path || path === "" || path === "[null]") {
      return "https://placehold.co/600x400?text=No+Image";
    }

    if (path.startsWith("http")) {
      return path.replace("127.0.0.1", "localhost");
    }

    const MINIO_ENDPOINT = "http://localhost:9000";
    const BUCKET = "foodiegram";
    
    return `${MINIO_ENDPOINT}/${BUCKET}/recipes/${path}`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    try {
      // Optimistic UI update
      setIsLiked(!isLiked);
      await api.post("/recipes/like", { recipe_id: recipe.id });
    } catch (error) {
      setIsLiked(recipe.is_liked || false); // Rollback state jika gagal ke server
      console.error("Like error:", error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsSaved(!isSaved);
      await api.post("/recipes/save", { recipe_id: recipe.id });
    } catch (error) {
      setIsSaved(recipe.is_saved || false); // Rollback state jika gagal ke server
      console.error("Save error:", error);
    }
  };

  return (
    <div className="flex flex-col group w-full">
      <Link to={`/recipe/${recipe.id}`} className="cursor-pointer">
        <div className="aspect-square rounded-[32px] overflow-hidden bg-slate-200 relative mb-2 shadow-sm border border-slate-200">
          <img src={getImageUrl(recipe.image_url)} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      </Link>

      <div className="flex justify-between items-center px-1 mb-1">
        <button 
          onClick={handleLike}
          className={`hover:scale-110 transition-all duration-200 ${isLiked ? 'text-red-500' : 'text-slate-800'}`}
        >
          <Heart className={`w-6 h-6 stroke-[2px] ${isLiked ? 'fill-current' : ''}`} />
        </button>

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

      <Link 
        to={`/user/${recipe.user_id}`} 
        className="flex items-center gap-1.5 px-1 mt-2 hover:opacity-70 transition-opacity"
      >
        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
          <User size={12} className="text-orange-600" />
        </div>
        <span className="text-xs font-semibold text-slate-700">
          @{recipe.username || "user"}
        </span>
      </Link>
    </div>
  );
};

export default RecipeCard;
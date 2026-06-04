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

  useEffect(() => {
    setIsLiked(!!recipe.is_liked);
    setIsSaved(!!recipe.is_saved);
  }, [recipe.is_liked, recipe.is_saved]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    try {
      setIsLiked(!isLiked);
      await api.post("/recipes/like", { recipe_id: recipe.id });
    } catch (error) {
      setIsLiked(recipe.is_liked || false);
      console.error("Like error:", error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsSaved(!isSaved);
      await api.post("/recipes/save", { recipe_id: recipe.id });
    } catch (error) {
      setIsSaved(recipe.is_saved || false);
      console.error("Save error:", error);
    }
  };

  // === 1. TARUH FUNGSI BARU DI SINI (DI ATAS RETURN) ===
  const getMediaElement = () => {
    const MINIO_ENDPOINT = "http://localhost:9000";
    const BUCKET = "foodiegram";

    // Kondisi jika data resep berupa video (reels)
    if ((recipe.post_type === 'reels' || !recipe.image_url) && recipe.video_url) {
      let finalVideoUrl = recipe.video_url.replace("127.0.0.1", "localhost");
      if (!finalVideoUrl.startsWith("http")) {
        finalVideoUrl = `${MINIO_ENDPOINT}/${BUCKET}/videos/${finalVideoUrl}`;
      }
      
      return (
        <div className="w-full h-full relative">
          <video 
            src={finalVideoUrl} 
            className="w-full h-full object-cover" 
            muted 
            playsInline
            preload="metadata"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
          />
          <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            📹 Video
          </div>
        </div>
      );
    }

    // Kondisi default jika data resep berupa foto biasa
    let path = recipe.image_url;
    let finalImageUrl = "https://placehold.co/600x400?text=No+Image";

    if (path && path !== "" && path !== "[null]") {
      if (path.startsWith("http")) {
        finalImageUrl = path.replace("127.0.0.1", "localhost");
      } else {
        finalImageUrl = `${MINIO_ENDPOINT}/${BUCKET}/recipes/${path}`;
      }
    }

    return (
      <img 
        src={finalImageUrl} 
        alt={recipe.title} 
        className="w-full h-full object-cover" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=FoodieGram";
        }}
      />
    );
  };

  return (
    <div className="flex flex-col group w-full">
      <Link to={`/recipe/${recipe.id}`} className="cursor-pointer">
        <div className="aspect-square rounded-[32px] overflow-hidden bg-slate-200 relative mb-2 shadow-sm border border-slate-200">
          
          {/* === 2. PANGGIL FUNGSINYA DI SINI SEBAGAI PENGGANTI TAG IMG LAMA === */}
          {getMediaElement()}

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
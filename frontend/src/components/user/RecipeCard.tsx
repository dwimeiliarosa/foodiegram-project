import type { Recipe } from "../../types/recipe";
import { Heart, Bookmark } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  // 1. Gunakan 127.0.0.1 agar lebih stabil dibanding 'localhost'
  const MINIO_BASE_URL = "http://127.0.0.1:9000/foodiegram/";

  // 2. Fungsi Helper yang lebih kuat
  const getImageUrl = (path: string | null | undefined) => {
    if (!path || path === "[null]" || path === "") return "";
console.log("Data Recipe:", recipe);

    // Bersihkan spasi jika ada
    const cleanPath = path.trim();

    // Jika dari database sudah URL lengkap
    if (cleanPath.startsWith("http")) {
      // Jika mengandung storage.com (link dummy di DB kamu), ganti ke placeholder
      if (cleanPath.includes("storage.com")) {
        return "https://via.placeholder.com/300?text=Link+Lama+Mati";
      }
      return cleanPath;
    }

    // Jika hanya nama file (seperti di MinIO kamu), gabungkan
    return `${MINIO_BASE_URL}${cleanPath}`;
  };

  return (
    <div className="flex flex-col group cursor-pointer w-full">
      {/* 1. Container Gambar */}
      <div className="aspect-square rounded-[32px] overflow-hidden bg-slate-100 relative mb-2 shadow-sm border border-slate-200">
        {recipe.image_url && recipe.image_url !== "[null]" ? (
          <img 
            src={getImageUrl(recipe.image_url)} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Jika link MinIO gagal (karena belum Public), tampilkan ini
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=Check+MinIO+Policy";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm italic bg-slate-50">
            No Image Available
          </div>
        )}
      </div>

      {/* 2. Bar Interaksi */}
      <div className="flex justify-between items-center px-1 mb-1">
        <button className="text-slate-800 hover:text-red-500 hover:scale-110 transition-all duration-200">
          <Heart className="w-6 h-6 stroke-[2px]" />
        </button>
        <button className="text-slate-800 hover:text-orange-500 hover:scale-110 transition-all duration-200">
          <Bookmark className="w-6 h-6 stroke-[2px]" />
        </button>
      </div>
      
      {/* 3. Judul & Info */}
      <div className="px-1">
        <h3 className="font-bold text-slate-900 text-lg md:text-xl line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {recipe.protein}g Protein • {recipe.views_count || 0} Views
        </p>
      </div>
    </div>
  );
};

export default RecipeCard;
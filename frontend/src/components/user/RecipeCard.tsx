import type { Recipe } from "../../types/recipe";
import { Heart, Bookmark } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <div className="flex flex-col group cursor-pointer w-full">
      {/* 1. Container Gambar: Menggunakan rounded-3xl agar mirip desain Figma */}
      <div className="aspect-square rounded-[32px] overflow-hidden bg-slate-100 relative mb-2 shadow-sm">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
            No Image Available
          </div>
        )}
      </div>

      {/* 2. Bar Interaksi: Ikon Heart & Bookmark */}
      <div className="flex justify-between items-center px-1 mb-1">
        <button className="text-slate-800 hover:text-red-500 hover:scale-110 transition-all duration-200">
          <Heart className="w-6 h-6 stroke-[2px]" />
        </button>
        <button className="text-slate-800 hover:text-orange-500 hover:scale-110 transition-all duration-200">
          <Bookmark className="w-6 h-6 stroke-[2px]" />
        </button>
      </div>
      
      {/* 3. Judul Resep: Menyesuaikan font agar lebih bersih */}
      <div className="px-1">
        <h3 className="font-bold text-slate-900 text-lg md:text-xl line-clamp-1">
        {recipe.title}
      </h3>
        {/* Opsional: Kamu bisa tambah info nutrisi/protein kecil di sini jika perlu */}
        <p className="text-xs text-slate-500 mt-0.5">{recipe.protein}g Protein • {recipe.views_count} Views</p>
      </div>
    </div>
  );
};

export default RecipeCard;
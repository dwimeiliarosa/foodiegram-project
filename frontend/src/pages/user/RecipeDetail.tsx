import { useEffect, useState } from 'react'; // Menghapus 'React' karena tidak dipakai langsung
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, Eye } from 'lucide-react'; // Menghapus Clock dan Flame yang tidak terpakai
import type { Recipe } from '../../types/recipe'; // WAJIB PAKAI 'type' agar error 1484 hilang

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error("Gagal mengambil detail resep:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipe();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-medium">Memuat resep lezat...</div>;
  if (!recipe) return <div className="p-8 text-center text-red-500">Resep tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl mx-auto pb-10 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-slate-600 hover:text-orange-500 transition-all"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Kembali</span>
      </button>

      {/* Gambar Besar */}
      <div className="relative w-full h-72 md:h-96 rounded-[2.5rem] overflow-hidden shadow-sm mb-6 bg-slate-200">
        <img 
          src={recipe.image ? `http://localhost:9000/foodiegram/${recipe.image}` : '/placeholder-recipe.png'} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{recipe.title}</h1>
          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-slate-500 text-sm">
            <Eye size={16} />
            <span>{recipe.views_count}</span>
          </div>
        </div>
        
        <p className="text-orange-600 font-medium mb-6">Oleh: @{recipe.username || 'FoodieUser'}</p>

        {/* Info Nutrisi */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 text-xs uppercase mb-1">Protein</p>
            <p className="font-bold text-lg text-slate-800">{recipe.protein}g</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 text-xs uppercase mb-1">Karbo</p>
            <p className="font-bold text-lg text-slate-800">{recipe.carbs ?? 0}g</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 text-xs uppercase mb-1">Lemak</p>
            <p className="font-bold text-lg text-slate-800">{recipe.fat ?? 0}g</p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Utensils size={20} className="text-orange-500" />
            Bahan-bahan
          </h2>
          <p className="text-slate-500 italic">Daftar bahan sedang diproses backend...</p>
        </section>
      </div>
    </div>
  );
};

export default RecipeDetail;
import { useForm, type SubmitHandler } from "react-hook-form"; // Tambahkan 'type' di sini
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// 1. Skema Validasi
const recipeSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  category_id: z.string().min(1, "Pilih kategori"),
  post_type: z.enum(["photo", "reels"]),
  ingredients: z.string().min(10, "Bahan minimal 10 karakter"),
  steps: z.string().min(10, "Langkah minimal 10 karakter"),
  cooking_time: z.coerce.number().min(1), // Pakai coerce agar tidak 'unknown'
  protein: z.coerce.number().optional(),
  carbs: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
  image: z.any()
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

export default function PostRecipe() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: { 
        post_type: "photo",
        cooking_time: 0 // Inisialisasi agar tidak dianggap unknown
    }
  });

  const onSubmit: SubmitHandler<RecipeFormValues> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category_id", data.category_id);
      formData.append("post_type", data.post_type);
      formData.append("ingredients", data.ingredients);
      formData.append("steps", data.steps);
      formData.append("cooking_time", String(data.cooking_time));
      
      if (data.protein) formData.append("protein", String(data.protein));
      if (data.carbs) formData.append("carbs", String(data.carbs));
      if (data.fat) formData.append("fat", String(data.fat));
      
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await api.post("/recipes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Resep berhasil dikirim!");
      navigate("/admin/resep");
    } catch (error) {
      toast.error("Gagal mengirim resep.");
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title")} className="border p-2 w-full" placeholder="Judul" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        
        <select {...register("category_id")} className="border p-2 w-full">
          <option value="">Pilih Kategori</option>
          <option value="1">Sarapan</option>
        </select>

        <button type="submit" disabled={isSubmitting} className="bg-orange-500 text-white p-2 rounded">
          {isSubmitting ? "Mengirim..." : "Posting Resep"}
        </button>
      </form>
    </div>
  );
}
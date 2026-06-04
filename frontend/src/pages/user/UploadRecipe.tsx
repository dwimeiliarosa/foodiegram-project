import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; 
import { UploadCloud, X, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UploadRecipe = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form State disesuaikan dengan Swagger
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [postType, setPostType] = useState<"photo" | "video">("photo");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Otomatis deteksi tipe konten
      setPostType(selectedFile.type.startsWith("video/") ? "video" : "photo");

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();

  // 1. Data Teks (Menyesuaikan dengan state asli di komponenmu)
  formData.append('title', title);
  formData.append('ingredients', ingredients);
  formData.append('steps', steps ); 
  formData.append('post_type', postType); // 'photo' atau 'reels'

  // 2. Data Angka (Wajib di-convert ke String/Number agar divalidasi backend)
  formData.append('category_id', String(Number(categoryId)));
  formData.append('cooking_time', String(Number(cookingTime)));
  formData.append('protein', String(Number(protein)));
  
  // 🔥 INI KUNCINYA: Mengirim ke backend dengan key 'carbs' menggunakan state 'carbs' atau 'car    o' milikmu
  formData.append('carbs', String(Number(carbs || carbs)));
  
  formData.append('fat', String(Number(fat)));

  // 3. File Media (Gambar / Video)
  // Menyesuaikan dengan state file asli milikmu yang terdeteksi bernama 'file'
  if (file) {
    formData.append('image', file); 
  }

  try {
    const response = await api.post('/recipes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200 || response.status === 201) {
      alert("Resep FoodieGram berhasil dipublish!");
      navigate('/profile');
    }
  } catch (error: any) {
    console.error("Gagal Ajukan Resep:", error.response?.data);
    alert(error.response?.data?.message || "Data tidak valid, periksa kembali inputan.");
  }
};
  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">Buat Resep Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Upload */}
        <div className="space-y-2">
          <Label>Foto atau Video Masakan</Label>
          <div className="relative group">
            <input id="media" type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="media" className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${previewUrl ? 'border-none' : 'border-slate-300 bg-slate-50'}`}>
              {previewUrl ? (
                postType === "video" ? (
                  <video src={previewUrl} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                )
              ) : (
                <div className="text-center p-6 space-y-2">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="text-sm text-slate-600 font-medium">Klik untuk upload media</p>
                </div>
              )}
            </label>
            {previewUrl && (
              <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg text-red-500">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Info Dasar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Resep</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul..." required />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Dessert</SelectItem>
                <SelectItem value="2">Main Course</SelectItem>
                <SelectItem value="3">Drink</SelectItem>
                <SelectItem value="4">Seafood</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deskripsi Masakan */}
        <div className="space-y-2">
          <Label htmlFor="ingredients">Bahan-bahan</Label>
          <Textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Contoh: 2 butir telur, garam secukupnya..." required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="steps">Langkah Memasak</Label>
          <Textarea id="steps" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="1. Kocok telur..." required />
        </div>

        {/* Detail Nutrisi & Waktu */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-2">
            <Label>Waktu Masak (Menit)</Label>
            <Input type="number" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Protein (g)</Label>
            <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Karbohidrat (g)</Label>
            <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Lemak (g)</Label>
            <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} required />
          </div>
        </div>

        <Button className="w-full bg-[#F27F22] hover:bg-[#d96d1a] py-6 text-lg font-bold rounded-2xl" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Publish Resep"}
        </Button>
      </form>
    </div>
  );
};

export default UploadRecipe;
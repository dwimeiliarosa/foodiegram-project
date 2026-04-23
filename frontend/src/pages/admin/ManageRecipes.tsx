import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Loader2, Pencil, Trash2, X } from "lucide-react";
import api from "../../lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ManageRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    image: null as File | null,
    ingredients: [""] as string[],
    steps: [""] as string[],
    protein: 0,
    carbs: 0,
    fat: 0,
    cooking_time: 0,
  });

  // Ambil draft jika sesi sempat habis
  useEffect(() => {
    const savedDraft = localStorage.getItem("foodiegram_recipe_draft");
    if (savedDraft && !editingRecipeId && isModalOpen) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed, image: null }));
      } catch (e) {
        console.error("Gagal pulihkan draft", e);
      }
    }
  }, [isModalOpen, editingRecipeId]);

  // Simpan ketikan ke draft secara otomatis
  useEffect(() => {
    if (!editingRecipeId && (formData.name || formData.category)) {
      localStorage.setItem("foodiegram_recipe_draft", JSON.stringify(formData));
    }
  }, [formData, editingRecipeId]);

  const handleApiError = (error: any, defaultMessage: string) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      toast.error("Sesi Berakhir", { description: "Draft Anda aman. Silakan login kembali." });
      localStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      const errMsg = error.response?.data?.message || defaultMessage;
      toast.error("Gagal", { description: errMsg });
    }
  };

  const fetchCats = async () => {
    try {
      const res = await api.get("/recipes/categories");
      setAvailableCategories(res.data.categories || res.data || []);
    } catch (err) {
      console.error("Gagal load kategori", err);
    }
  };

  const fetchRecipes = async () => {
    setIsLoadingData(true);
    try {
      const response = await api.get("/recipes/my-recipes");
      const data = response.data.recipes || response.data;
      if (Array.isArray(data)) {
        setRecipes(data.map((r: any) => ({
          ...r,
          displayImage: r.image_url || "https://ui-avatars.com/api/?name=Recipe",
        })));
      }
    } catch (error) {
      handleApiError(error, "Gagal mengambil daftar resep.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCats();
    fetchRecipes();
  }, []);

  const resetForm = () => {
    setEditingRecipeId(null);
    setFormData({
      name: "", category: "", image: null,
      ingredients: [""], steps: [""], protein: 0, carbs: 0, fat: 0, cooking_time: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.category) return toast.error("Kategori harus dipilih!");

  setIsSubmitting(true);
  try {
    if (editingRecipeId) {
      // UNTUK UPDATE: Kirim sebagai JSON (Sesuai Swagger Dwi)
      const updateData = {
        title: formData.name,
        category_id: parseInt(formData.category), // Ubah ke integer sesuai swagger
        ingredients: formData.ingredients.filter(i => i.trim() !== "").join(", "),
        steps: formData.steps.filter(s => s.trim() !== "").join(". ")
      };

      await api.put(`/recipes/${editingRecipeId}`, updateData); // Axios otomatis set header application/json
      toast.success("Resep berhasil diperbarui!");
      
    } else {
      // UNTUK CREATE: Tetap pakai FormData (Karena butuh upload gambar)
      const fd = new FormData();
      fd.append("title", formData.name);
      fd.append("category_id", formData.category);
      fd.append("ingredients", formData.ingredients.filter(i => i.trim() !== "").join(", "));
      fd.append("steps", formData.steps.filter(s => s.trim() !== "").join(". "));
      fd.append("cooking_time", formData.cooking_time.toString());
      fd.append("protein", formData.protein.toString());
      fd.append("carbs", formData.carbs.toString());
      fd.append("fat", formData.fat.toString());
      fd.append("post_type", "photo");

      if (formData.image instanceof File) {
        fd.append("image", formData.image);
      }

      await api.post("/recipes", fd);
      toast.success("Resep berhasil dibuat!");
      localStorage.removeItem("foodiegram_recipe_draft");
    }
    
    setIsModalOpen(false);
    resetForm();
    fetchRecipes();
  } catch (error: any) {
    console.error("Error detail:", error.response?.data);
    handleApiError(error, "Gagal menyimpan resep.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Resep</h1>
            <p className="text-slate-500 text-sm">Kelola konten resep Anda dengan aman.</p>
          </div>
          <Button className="bg-[#F27F22] hover:bg-[#d96d1a]" onClick={() => { 
            if (editingRecipeId) resetForm(); 
            setIsModalOpen(true); 
          }}>
            <Plus size={18} className="mr-2" /> Tambah Resep
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(val) => {
          setIsModalOpen(val);
          if (!val) setEditingRecipeId(null);
        }}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>{editingRecipeId ? "Edit Resep" : "Tambah Resep"}</DialogTitle>
              <DialogDescription>Pastikan semua data resep terisi dengan benar.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Resep</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama masakan" required />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border">
                <Label className="flex justify-between mb-2">Bahan <Button type="button" size="sm" variant="ghost" onClick={() => setFormData(prev => ({...prev, ingredients: [...prev.ingredients, ""]}))}>+ Tambah</Button></Label>
                {formData.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={ing} onChange={(e) => {
                      const newIng = [...formData.ingredients];
                      newIng[i] = e.target.value;
                      setFormData({...formData, ingredients: newIng});
                    }} placeholder="Contoh: 100g Cokelat" required />
                    <Button type="button" size="icon" variant="ghost" onClick={() => setFormData(prev => ({...prev, ingredients: prev.ingredients.filter((_, idx) => idx !== i)}))} disabled={formData.ingredients.length === 1}><X size={14} /></Button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border">
                <Label className="flex justify-between mb-2">Langkah Pembuatan <Button type="button" size="sm" variant="ghost" onClick={() => setFormData(prev => ({...prev, steps: [...prev.steps, ""]}))}>+ Tambah</Button></Label>
                {formData.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="mt-2 text-xs font-bold text-slate-400 w-4">{i+1}</span>
                    <Input value={step} onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[i] = e.target.value;
                      setFormData({...formData, steps: newSteps});
                    }} placeholder="Langkah pembuatan" required />
                    <Button type="button" size="icon" variant="ghost" onClick={() => setFormData(prev => ({...prev, steps: prev.steps.filter((_, idx) => idx !== i)}))} disabled={formData.steps.length === 1}><X size={14} /></Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div><Label className="text-[10px]">Protein (g)</Label><Input type="number" value={formData.protein} onChange={(e) => setFormData({...formData, protein: parseFloat(e.target.value) || 0})} /></div>
                <div><Label className="text-[10px]">Karbo (g)</Label><Input type="number" value={formData.carbs} onChange={(e) => setFormData({...formData, carbs: parseFloat(e.target.value) || 0})} /></div>
                <div><Label className="text-[10px]">Lemak (g)</Label><Input type="number" value={formData.fat} onChange={(e) => setFormData({...formData, fat: parseFloat(e.target.value) || 0})} /></div>
                <div><Label className="text-[10px]">Menit</Label><Input type="number" value={formData.cooking_time} onChange={(e) => setFormData({...formData, cooking_time: parseInt(e.target.value) || 0})} /></div>
              </div>

              <div className="space-y-2">
                <Label>Foto Resep</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})} required={!editingRecipeId} />
                {editingRecipeId && <p className="text-[10px] text-slate-400">*Kosongkan jika tidak ingin mengganti foto</p>}
              </div>

              <Button type="submit" className="w-full bg-[#F27F22] hover:bg-[#d96d1a]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingRecipeId ? "Update Resep" : "Simpan Resep"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead className="w-20">Foto</TableHead><TableHead>Judul</TableHead><TableHead>Kategori</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoadingData ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#F27F22]" /></TableCell></TableRow>
              ) : recipes.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Belum ada resep.</TableCell></TableRow>
              ) : recipes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden border">
                      <img src={r.displayImage} alt={r.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://ui-avatars.com/api/?name=Recipe")} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.category_name || "Umum"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingRecipeId(r.id);
                      
                      // Handling ingredients (Backend kirim Array)
                      const ingData = Array.isArray(r.ingredients) ? r.ingredients : [r.ingredients || ""];
                      
                      // Handling steps (Backend kirim String)
                      const stepData = typeof r.steps === "string" ? r.steps.split(". ") : [""];

                      setFormData({
                        name: r.title,
                        category: r.category_id?.toString() || "",
                        image: null,
                        ingredients: ingData,
                        steps: stepData,
                        protein: r.protein || 0,
                        carbs: r.carbs || 0,
                        fat: r.fat || 0,
                        cooking_time: r.cooking_time || 0,
                      });
                      setIsModalOpen(true);
                    }}><Pencil size={16} /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={async () => {
                      if (confirm("Hapus resep ini?")) {
                        try {
                          await api.delete(`/recipes/${r.id}`);
                          toast.success("Resep telah dihapus");
                          fetchRecipes();
                        } catch {
                          toast.error("Gagal menghapus resep");
                        }
                      }
                    }}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default ManageRecipes;
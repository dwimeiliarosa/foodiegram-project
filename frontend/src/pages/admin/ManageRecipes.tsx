import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import api from "../../lib/axios";
import { toast } from "sonner"; // Import Toast

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: null as File | null,
    ingredients: [""],
    steps: [""],
    protein: 0,
    carbs: 0,
    fat: 0,
    cooking_time: 0,
  });

  const fetchCats = async () => {
    try {
      const res = await api.get("/recipes/categories");
      const data = res.data.categories || res.data;
      setAvailableCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal load kategori", err);
    }
  };

  const fetchRecipes = async () => {
    setIsLoadingData(true);
    try {
      const response = await api.get("/recipes/my-recipes");
      const dataDariDwi = response.data.recipes;
      if (Array.isArray(dataDariDwi)) {
        const formattedRecipes = dataDariDwi.map((r: any) => ({
          ...r,
          id: r.id,
          name: r.title,
          category: r.category_name,
          image: r.image_url?.startsWith("http") ? r.image_url : `http://localhost:5000${r.image_url}`,
        }));
        setRecipes(formattedRecipes);
      }
    } catch (error) {
      toast.error("Gagal mengambil data resep");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCats();
    fetchRecipes();
  }, []);

  const openEditModal = (recipe: any) => {
    setEditingRecipeId(recipe.id);
    setFormData({
      name: recipe.title || recipe.name,
      description: recipe.description || "",
      category: recipe.category_id?.toString() || "",
      image: null,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : (recipe.ingredients ? recipe.ingredients.split(", ") : [""]),
      steps: Array.isArray(recipe.steps) ? recipe.steps : (recipe.steps ? recipe.steps.split(". ") : [""]),
      protein: recipe.protein || 0,
      carbs: recipe.carbs || 0,
      fat: recipe.fat || 0,
      cooking_time: recipe.cooking_time || 0,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingRecipeId(null);
    setFormData({
      name: "", description: "", category: "", image: null,
      ingredients: [""], steps: [""], protein: 0, carbs: 0, fat: 0, cooking_time: 0,
    });
  };

  const isFormValid = useMemo(() => {
    return formData.name.trim() !== "" && formData.category !== "" && (editingRecipeId !== null || formData.image !== null);
  }, [formData, editingRecipeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const jsonData = {
        category_id: Number(formData.category),
        title: formData.name,
        ingredients: formData.ingredients.filter(i => i !== "").join(", "),
        steps: formData.steps.filter(s => s !== "").join(". "),
        cooking_time: Number(formData.cooking_time),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        post_type: "photo"
      };

      if (editingRecipeId) {
        if (formData.image instanceof File) {
          const fd = new FormData();
          Object.entries(jsonData).forEach(([key, val]) => fd.append(key, val.toString()));
          fd.append("image", formData.image);
          await api.put(`/recipes/${editingRecipeId}`, fd);
        } else {
          await api.put(`/recipes/${editingRecipeId}`, jsonData);
        }
        toast.success("Berhasil!", { description: "Resep telah diperbarui." });
      } else {
        const fd = new FormData();
        Object.entries(jsonData).forEach(([key, val]) => fd.append(key, val.toString()));
        if (formData.image) fd.append("image", formData.image);
        await api.post("/recipes", fd);
        toast.success("Berhasil!", { description: "Resep baru ditambahkan." });
      }
      setIsModalOpen(false);
      resetForm();
      fetchRecipes();
    } catch (error: any) {
      toast.error("Gagal menyimpan resep", { description: error.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resep dihapus");
    } catch (error: any) {
      toast.error("Gagal menghapus resep");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Daftar Resep</h1>
            <p className="text-slate-500">Kelola semua resep makanan dan minuman di sini.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if(!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#F27F22] hover:bg-[#d96d1a] gap-2" onClick={resetForm}>
                <Plus size={18} /> Tambah Resep
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRecipeId ? "Edit Resep" : "Tambah Resep Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                <div className="space-y-2"><Label>Nama Resep</Label><Input id="name" value={formData.name} onChange={handleInputChange} /></div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableCategories.map((cat) => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Protein</Label><Input type="number" value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })} /></div>
                  <div><Label>Karbo</Label><Input type="number" value={formData.carbs} onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })} /></div>
                  <div><Label>Lemak</Label><Input type="number" value={formData.fat} onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })} /></div>
                </div>
                <div className="space-y-2"><Label>Gambar</Label><Input type="file" onChange={(e) => setFormData({ ...prev, image: e.target.files![0] })} /></div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#F27F22]" disabled={!isFormValid || isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Simpan Resep"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border shadow-sm mt-6 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Gambar</TableHead><TableHead>Nama</TableHead><TableHead>Kategori</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoadingData ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-[#F27F22]" /></TableCell></TableRow>
              ) : recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell><img src={recipe.image} className="w-12 h-12 object-cover rounded-lg" /></TableCell>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.category}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(recipe)}><Pencil size={16} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 size={16} /></Button></AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader><AlertDialogTitle>Hapus Resep?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500" onClick={() => handleDelete(recipe.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
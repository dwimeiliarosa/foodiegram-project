import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Loader2, Pencil, Trash2, X, Check, XCircle, Search } from "lucide-react";
import api from "../../lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  // --- LOGIKA DRAFT (FITUR AMAN) ---
  useEffect(() => {
    const savedDraft = localStorage.getItem("foodiegram_recipe_draft");
    if (savedDraft && !editingRecipeId && isModalOpen) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed, image: null }));
      } catch (e) { console.error("Gagal pulihkan draft", e); }
    }
  }, [isModalOpen, editingRecipeId]);

  useEffect(() => {
    if (!editingRecipeId && (formData.name || formData.category)) {
      localStorage.setItem("foodiegram_recipe_draft", JSON.stringify(formData));
    }
  }, [formData, editingRecipeId]);

  const fetchCats = async () => {
    try {
      const res = await api.get("/recipes/categories");
      setAvailableCategories(res.data.categories || res.data || []);
    } catch (err) { console.error("Gagal load kategori", err); }
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
    } catch (error) { toast.error("Gagal mengambil daftar resep."); }
    finally { setIsLoadingData(false); }
  };

  useEffect(() => { fetchCats(); fetchRecipes(); }, []);

  // --- FUNGSI VERIFIKASI (APPROVE & REJECT) ---
  const handleVerify = async (id: number, status: string) => {
    try {
      // 1. Method diganti jadi .patch
      // 2. URL diganti jadi /recipes/admin/verify/${id} 
      // (Asumsi base URL api kamu sudah ke /recipes, kalau belum sesuaikan full pathnya)
      const response = await api.patch(`/recipes/admin/verify/${id}`, { status });
      
      // Ambil pesan sukses dari backend (biar muncul ✅ atau ❌)
      toast.success("Berhasil", { description: response.data.message });
      
      fetchRecipes(); // Refresh tabel agar status berubah
    } catch (error: any) {
      console.error("Error Status:", error.response?.data);
      toast.error("Gagal", { 
        description: error.response?.data?.message || "Gagal memperbarui status" 
      });
    }
  };

  // --- FUNGSI DELETE ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus resep ini?")) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success("Resep telah dihapus");
      fetchRecipes();
    } catch { toast.error("Gagal menghapus resep"); }
  };

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
        // UPDATE: Sesuai Swagger Dwi (JSON)
        const updateData = {
          title: formData.name,
          category_id: parseInt(formData.category), // Fix: Kirim as Integer
          ingredients: formData.ingredients.filter(i => i.trim() !== "").join(", "),
          steps: formData.steps.filter(s => s.trim() !== "").join(". ")
        };
        await api.put(`/recipes/${editingRecipeId}`, updateData);
      } else {
        // CREATE: Pakai FormData untuk Upload Image
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
        if (formData.image) fd.append("image", formData.image);
        await api.post("/recipes", fd);
        localStorage.removeItem("foodiegram_recipe_draft");
      }
      toast.success("Berhasil!");
      setIsModalOpen(false);
      resetForm();
      fetchRecipes();
    } catch (error) { toast.error("Gagal menyimpan."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Resep</h1>
            <p className="text-slate-500 text-sm">Kelola data resep FoodieGram.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input placeholder="Cari..." className="pl-10 w-64 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button className="bg-[#F27F22] hover:bg-[#d96d1a]" onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <Plus size={18} className="mr-2" /> Tambah Resep
            </Button>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if (!val) setEditingRecipeId(null); }}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>{editingRecipeId ? "Edit Resep" : "Tambah Resep"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Resep</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableCategories.map((c: any) => (<SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <Label className="flex justify-between mb-2">Bahan <Button type="button" size="sm" variant="ghost" onClick={() => setFormData(p => ({...p, ingredients: [...p.ingredients, ""]}))}>+ Tambah</Button></Label>
                {formData.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={ing} onChange={(e) => { const n = [...formData.ingredients]; n[i] = e.target.value; setFormData({...formData, ingredients: n}); }} required />
                    <Button type="button" size="icon" variant="ghost" onClick={() => setFormData(p => ({...p, ingredients: p.ingredients.filter((_, idx) => idx !== i)}))} disabled={formData.ingredients.length === 1}><X size={14} /></Button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <Label className="flex justify-between mb-2">Langkah <Button type="button" size="sm" variant="ghost" onClick={() => setFormData(p => ({...p, steps: [...p.steps, ""]}))}>+ Tambah</Button></Label>
                {formData.steps.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="mt-2 text-xs font-bold text-slate-400 w-4">{i+1}</span>
                    <Input value={s} onChange={(e) => { const n = [...formData.steps]; n[i] = e.target.value; setFormData({...formData, steps: n}); }} required />
                    <Button type="button" size="icon" variant="ghost" onClick={() => setFormData(p => ({...p, steps: p.steps.filter((_, idx) => idx !== i)}))} disabled={formData.steps.length === 1}><X size={14} /></Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div><Label>Protein</Label><Input type="number" value={formData.protein} onChange={(e) => setFormData({...formData, protein: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Karbo</Label><Input type="number" value={formData.carbs} onChange={(e) => setFormData({...formData, carbs: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Lemak</Label><Input type="number" value={formData.fat} onChange={(e) => setFormData({...formData, fat: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Menit</Label><Input type="number" value={formData.cooking_time} onChange={(e) => setFormData({...formData, cooking_time: parseInt(e.target.value) || 0})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Foto Resep</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})} required={!editingRecipeId} />
              </div>
              <Button type="submit" className="w-full bg-[#F27F22] hover:bg-[#d96d1a]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingRecipeId ? "Update Resep" : "Simpan Resep"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Foto</TableHead><TableHead>Judul</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoadingData ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#F27F22]" /></TableCell></TableRow>
              ) : recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((r) => (
                <TableRow key={r.id}>
                  <TableCell><img src={r.displayImage} className="w-10 h-10 rounded object-cover border" /></TableCell>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell><Badge className={r.status === 'approved' ? "bg-green-100 text-green-700" : r.status === 'rejected' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>{r.status || 'pending'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.status === 'pending' && (
                        <><Button size="icon" variant="ghost" className="text-green-600" onClick={() => handleVerify(r.id, 'approved')}><Check size={18} /></Button>
                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleVerify(r.id, 'rejected')}><XCircle size={18} /></Button></>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingRecipeId(r.id);
                        setFormData({
                          name: r.title, category: r.category_id?.toString() || "", image: null,
                          ingredients: Array.isArray(r.ingredients) ? r.ingredients : (r.ingredients?.split(", ") || [""]),
                          steps: typeof r.steps === "string" ? r.steps.split(". ") : [""] ,
                          protein: r.protein || 0, carbs: r.carbs || 0, fat: r.fat || 0, cooking_time: r.cooking_time || 0,
                        });
                        setIsModalOpen(true);
                      }}><Pencil size={16} /></Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(r.id)}><Trash2 size={16} /></Button>
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
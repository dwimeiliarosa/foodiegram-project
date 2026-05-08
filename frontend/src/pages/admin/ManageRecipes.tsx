import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Loader2, Pencil, Trash2, X, Check, XCircle, Search } from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ManageRecipes = () => {
  const navigate = useNavigate();
const [recipes, setRecipes] = useState<any[]>([]);
const [availableCategories, setAvailableCategories] = useState<any[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isLoadingData, setIsLoadingData] = useState(true);
const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);

// BAGIAN YANG SERING ERROR:
const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
const [rejectId, setRejectId] = useState<number | null>(null);
const [rejectReason, setRejectReason] = useState(""); 
const [filterStatus, setFilterStatus] = useState("all"); 
const [searchTerm, setSearchTerm] = useState("");

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

  // --- LOGIKA DRAFT ---
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
      const [resPublic, resPending] = await Promise.allSettled([
        api.get("/recipes"),
        api.get("/recipes/admin/pending")
      ]);

      const publicData = resPublic.status === "fulfilled" 
        ? (resPublic.value.data?.data || resPublic.value.data || []) 
        : [];

      const pendingData = resPending.status === "fulfilled" 
        ? (resPending.value.data?.data || resPending.value.data || []) 
        : [];

      const combinedData = [
        ...(Array.isArray(publicData) ? publicData : []),
        ...(Array.isArray(pendingData) ? pendingData : [])
      ];

      const uniqueRecipes = Array.from(
        new Map(combinedData.map((item: any) => [item.id, item])).values()
      );

      const formattedData = uniqueRecipes.map((r: any) => ({
        ...r,
        displayImage: r.image_url || r.image || "https://ui-avatars.com/api/?name=Recipe",
        status: (r.status || "approved").toLowerCase()
      }));

      setRecipes(formattedData);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => { fetchCats(); fetchRecipes(); }, []);

  const handleVerify = async (id: number | string, status: 'approved' | 'rejected') => {
  try {
    await api.patch(`/recipes/admin/verify/${id}`, { 
      status,
      rejection_reason: status === 'rejected' ? rejectReason : "" 
    });
    
    toast.success(`Resep berhasil di-${status}`);
    setIsRejectModalOpen(false);
    setRejectReason("");
    fetchRecipes(); // Panggil ini supaya tabel update otomatis
  } catch (error) {
    toast.error("Gagal verifikasi");
  }
};

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus resep ini?")) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success("Resep telah dihapus");
      fetchRecipes();
    } catch { toast.error("Gagal menghapus resep"); }
  };

  const handleEdit = (recipe: any) => {
    setEditingRecipeId(recipe.id);
    setFormData({
      name: recipe.title,
      category: recipe.category_id?.toString() || "",
      image: null,
      ingredients: recipe.ingredients ? recipe.ingredients.split(", ") : [""],
      steps: recipe.steps ? recipe.steps.split(". ") : [""],
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
        const updateData = {
          title: formData.name,
          category_id: parseInt(formData.category),
          ingredients: formData.ingredients.filter(i => i.trim() !== "").join(", "),
          steps: formData.steps.filter(s => s.trim() !== "").join(". ")
        };
        await api.put(`/recipes/${editingRecipeId}`, updateData);
      } else {
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

  const filteredRecipes = (recipes || []).filter((recipe: any) => {
  const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = filterStatus === "all" || recipe.status === filterStatus;
  return matchesSearch && matchesStatus;
});

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
              <Input 
                placeholder="Cari judul..." 
                className="pl-10 w-64 bg-white" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <Button className="bg-[#F27F22] hover:bg-[#d96d1a]" onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <Plus size={18} className="mr-2" /> Tambah Resep
            </Button>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if (!val) resetForm(); }}>
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

        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-red-600">Tolak Resep</DialogTitle>
              <DialogDescription>Berikan alasan mengapa resep ini ditolak.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">Alasan Penolakan</Label>
              <textarea
                id="reason"
                className="w-full mt-2 p-3 border rounded-md text-sm focus:ring-[#F27F22]"
                placeholder="Contoh: Foto kurang jelas..."
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Batal</Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!rejectReason.trim()}
                onClick={() => rejectId && handleVerify(rejectId, 'rejected')}
              >
                Kirim Penolakan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              filterStatus === status
                ? "bg-[#F27F22] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto text-[#F27F22]" />
                  </TableCell>
                </TableRow>
              ) : filteredRecipes.length > 0 ? (
                filteredRecipes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <img src={r.displayImage} className="w-10 h-10 rounded object-cover border" alt={r.title} />
                    </TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        r.status === 'approved' ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
                      )}>
                        {r.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 italic">
                        {r.status === 'rejected' ? (r.message || r.rejection_reason || "Tanpa alasan") : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {r.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-green-600 h-8" onClick={() => handleVerify(r.id, 'approved')}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleVerify(r.id, 'rejected')}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(r)}>
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    Tidak ada resep yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default ManageRecipes;
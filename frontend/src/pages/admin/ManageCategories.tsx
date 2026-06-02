import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Pencil, Trash2, Tags, Search, Loader2 } from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

const ManageCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Ambil Data dari API Swagger Dwi
  const fetchCategories = async () => {
    setIsLoadingData(true);
    try {
      const response = await api.get("/recipes/categories");
      // Menangani variasi format array atau pembungkus objek respons
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      toast.error("Gagal mengambil data kategori");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setNewCategory(cat.name);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsLoading(true);
    try {
      if (editingCategory) {
        // PUT /api/recipes/categories/{id} sesuai Swagger
        await api.put(`/recipes/categories/${editingCategory.id}`, { name: newCategory });
        toast.success("Berhasil!", { description: "Kategori telah diperbarui." });
      } else {
        // POST /api/recipes/categories sesuai Swagger
        await api.post("/recipes/categories", { name: newCategory });
        toast.success("Berhasil!", { description: "Kategori baru telah ditambahkan." });
      }
      
      setNewCategory("");
      setEditingCategory(null);
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error("Gagal!", { description: error.response?.data?.message || "Terjadi kesalahan database." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      // DELETE /api/recipes/categories/{id} sesuai Swagger
      const response = await api.delete(`/recipes/categories/${id}`);
      if (response.status === 200 || response.status === 204) {
        toast.success("Kategori berhasil dihapus");
        fetchCategories(); 
      }
    } catch (error: any) {
      toast.error("Gagal menghapus kategori", {
        description: error.response?.data?.message || "Kategori ini masih terikat dengan resep aktif."
      });
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:pl-64 p-4 lg:p-8 w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Tags className="text-[#F27F22]" /> Manajemen Kategori
            </h1>
            <p className="text-slate-500">Atur kategori menu untuk FoodieGram.</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) { setEditingCategory(null); setNewCategory(""); }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#F27F22] hover:bg-[#d96d1a] gap-2">
                <Plus size={18} /> Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
                <DialogDescription>Masukkan nama kategori untuk mengelompokkan resep.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nama Kategori</Label>
                  <Input 
                    id="categoryName" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Contoh: Sarapan, Dessert, dll"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#F27F22]" disabled={!newCategory.trim() || isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Simpan Kategori"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input 
              placeholder="Cari kategori..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[80px]">No</TableHead>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>ID Kategori</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-[#F27F22]" size={32} />
                        <p className="text-slate-500">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat, index) => (
                    <TableRow key={cat.id || index}>
                      <TableCell className="text-slate-500">{index + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-700">{cat.name}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-mono">
                          ID: {cat.id}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => openEditModal(cat)}>
                            <Pencil size={14} />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak bisa dibatalkan. Resep dengan kategori ini mungkin perlu disesuaikan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-red-500 hover:bg-red-600">
                                  Ya, Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-slate-400">
                      Tidak ada kategori ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageCategories;
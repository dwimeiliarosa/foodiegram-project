import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/admin/Sidebar';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/recipes/admin/all');
      setRecipes(res.data.data || res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const handleVerify = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/recipes/admin/verify/${id}`, { 
        status, 
        rejection_reason: status === 'rejected' ? rejectionReason : "" 
      });
      toast.success(`Berhasil di-${status}`);
      setIsRejectModalOpen(false);
      setRejectionReason("");
      fetchRecipes();
    } catch (error) { toast.error("Gagal verifikasi"); }
  };

  const filteredRecipes = (recipes || []).filter((r: any) => {
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Manajemen Resep</h1>
        {/* Kamu bisa masukkan tabel kamu di sini nanti */}
        
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Tolak Resep</DialogTitle>
              <DialogDescription>Berikan alasan penolakan.</DialogDescription>
            </DialogHeader>
            <textarea 
              className="w-full p-2 border rounded mt-2" 
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Batal</Button>
              <Button 
                variant="destructive" 
                onClick={() => rejectId && handleVerify(rejectId, 'rejected')}
                disabled={!rejectionReason.trim()}
              >
                Kirim Penolakan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ManageRecipes;
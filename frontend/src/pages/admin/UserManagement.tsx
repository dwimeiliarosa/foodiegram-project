import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import api from "../../lib/axios";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Mail, 
  BookOpen, 
  Calendar,
  ShieldCheck,
  UserX,
  Loader2,
  Shield
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Interface disesuaikan 100% dengan Response JSON Swagger Dwi
interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  photo_profile: string | null;
  created_at: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi fetch data dari API Swagger: GET /api/auth/users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/users");
      // Mengantisipasi struktur bersarang data bervariasi dari backend
      const data = res.data.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
      toast.error("Gagal sinkronisasi daftar pengguna dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper untuk mengubah string tanggal ISO (2026-04-22T...) menjadi format cantik lokal
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2xl" as any || "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Filter pencarian berdasarkan username atau email secara lokal
  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        
        {/* HEADER SECTION */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <Users className="text-[#F27F22]" size={32} />
              Manajemen Pengguna
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Pantau dan kelola hak akses seluruh member FoodieGram.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 self-start sm:self-center">
            {loading ? (
              <Loader2 className="animate-spin text-slate-400" size={16} />
            ) : (
              <span className="text-sm font-bold text-slate-600">Total: {filteredUsers.length} User</span>
            )}
          </div>
        </header>

        {/* UTILITIES: SEARCH BAR */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input 
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#F27F22] rounded-xl"
            />
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Pengguna</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Hak Akses (Role)</th>
                  <th className="py-4 px-6">Tanggal Bergabung</th>
                  <th className="py-4 px-6">Status Akun</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-600 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-[#F27F22]" size={28} />
                        <span className="text-xs font-semibold text-slate-400">Mengunduh data dari database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Nama Pengguna */}
                      <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                        {user.photo_profile ? (
                          <img 
                            src={user.photo_profile} 
                            alt={user.username} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-100"
                            onError={(e) => {
                              // Fallback jika path image dari object storage corrupt/error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F27F22] flex items-center justify-center text-xs font-black uppercase">
                            {user.username?.substring(0, 2)}
                          </div>
                        )}
                        <span>@{user.username}</span>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          {user.email}
                        </span>
                      </td>

                      {/* Role (Kebutuhan Sidang: Deteksi Admin vs User Umum) */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          user.role === "admin" 
                            ? "bg-purple-50 text-purple-600 border border-purple-100" 
                            : "bg-slate-50 text-slate-600 border border-slate-100"
                        }`}>
                          {user.role === "admin" && <Shield size={12} />}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>

                      {/* Tanggal Bergabung */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      {/* Status Terbaca Aktif Default dari Database */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                          Aktif
                        </span>
                      </td>

                      {/* Aksi (Tombol Suspen Protektif) */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user.role === "admin" ? (
                            <span className="text-xs text-slate-300 italic">Protected</span>
                          ) : (
                            <Button 
                              variant="ghost" 
                              onClick={() => toast.info(`Aksi suspen @${user.username} memerlukan kebijakan final tim backend.`)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-xl"
                              title="Suspen Pengguna"
                            >
                              <UserX size={18} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                      Pengguna tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default UserManagement;
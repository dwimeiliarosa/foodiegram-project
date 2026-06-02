import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { 
  Users, 
  Search, 
  Mail, 
  BookOpen, 
  Calendar,
  ShieldCheck,
  UserX
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Interfaces untuk tipe data user
interface UserData {
  id: number;
  username: string;
  email: string;
  total_posts: number;
  joined_at: string;
  role: string;
  status: "Aktif" | "Nonaktif";
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Data Dummy untuk kebutuhan UI & Progres PKL
  const [users] = useState<UserData[]>([
    { id: 1, username: "wanda_lestari", email: "wanda@gmail.com", total_posts: 12, joined_at: "12 Mar 2026", role: "User", status: "Aktif" },
    { id: 2, username: "budi_sanjaya", email: "budi.s@gmail.com", total_posts: 8, joined_at: "05 Apr 2026", role: "User", status: "Aktif" },
    { id: 3, username: "amalia_putri", email: "amalia@gmail.com", total_posts: 0, joined_at: "20 Apr 2026", role: "User", status: "Nonaktif" },
    { id: 4, username: "rizky_ramadhan", email: "rizkyr@gmail.com", total_posts: 15, joined_at: "01 Mei 2026", role: "User", status: "Aktif" },
  ]);

  // Filter pencarian berdasarkan username atau email
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span className="text-sm font-bold text-slate-600">Total: {users.length} User</span>
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
                  <th className="py-4 px-6">Total Resep</th>
                  <th className="py-4 px-6">Tanggal Bergabung</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-600 font-medium">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Nama Pengguna */}
                      <td className="py-4 px-6 font-bold text-slate-800">
                        @{user.username}
                      </td>
                      {/* Email */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          {user.email}
                        </span>
                      </td>
                      {/* Total Resep */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2 text-slate-700">
                          <BookOpen size={16} className="text-[#F27F22]" />
                          {user.total_posts} Resep
                        </span>
                      </td>
                      {/* Tanggal Bergabung */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          {user.joined_at}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === "Aktif" 
                            ? "bg-green-50 text-green-600" 
                            : "bg-red-50 text-red-600"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      {/* Aksi (Suspen/Banned) */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user.status === "Aktif" ? (
                            <Button 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-xl"
                              title="Suspen Pengguna"
                            >
                              <UserX size={18} />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              className="text-green-500 hover:text-green-700 hover:bg-green-50 p-2 h-auto rounded-xl"
                              title="Aktifkan Kembali"
                            >
                              <ShieldCheck size={18} />
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
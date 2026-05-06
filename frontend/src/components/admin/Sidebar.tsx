import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Tag, 
  LogOut,
  BellRing 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [notif, setNotif] = React.useState(0);

  React.useEffect(() => {
  const getPendingNotif = async () => {
    try {
      const response = await api.get("/recipes/admin/all"); // Gunakan endpoint semua resep
      const allData = response.data.recipes || response.data;
      
      // Filter hanya yang statusnya pending
      const pendingCount = allData.filter((r: any) => r.status === 'pending').length;
      setNotif(pendingCount);
    } catch (err) {
      console.log("Gagal ambil notif");
    }
  };

  getPendingNotif();
  // Opsional: Cek tiap 30 detik agar seolah-olah real-time
  const interval = setInterval(getPendingNotif, 30000);
  return () => clearInterval(interval);
}, []);

  const menuItems = [
    { 
      title: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      title: "Control Resep", 
      path: "/admin/resep", // Sesuai dengan halaman yang kita kerjakan tadi
      icon: <Utensils size={20} />,
      badge: notif > 0 ? notif : null, 
    },
    { 
      title: "Kategori", 
      path: "/admin/kategori", 
      icon: <Tag size={20} /> 
    },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
      // Hapus semua penanda login (Sesuaikan dengan yang dipakai di axios.ts)
      localStorage.removeItem("authToken"); 
      localStorage.removeItem("userRole");
      localStorage.removeItem("foodiegram_recipe_draft"); // Opsional: hapus draft juga
      navigate("/login"); // Biasanya admin login di halaman login utama atau /admin/login
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      {/* Logo Section - Telur Mata Sapi Mantap! */}
      <div className="p-6 flex flex-col items-center gap-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-200">
             <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/30 rounded-full" />
             <div className="w-8 h-8 bg-white rounded-full border-4 border-orange-300 flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-inner" />
             </div>
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-slate-800">
            Foodie<span className="text-[#F27F22]">Gram</span>
          </h1>
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-[2px] font-medium">Media Sosial Resep</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          // Logic isActive: biar menyala walau ada sub-path
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-[#F27F22] text-white shadow-md shadow-orange-100"
                  : "text-slate-500 hover:bg-orange-50 hover:text-[#F27F22]"
              )}
            >
              <span className={cn(
                "transition-colors duration-300",
                isActive ? "text-white" : "text-slate-400 group-hover:text-[#F27F22]"
              )}>
                {item.icon}
              </span>
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Admin Singkat (Opsional - Biar makin pro) */}
      <div className="px-6 py-4 bg-slate-50 mx-4 rounded-xl mb-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F27F22] text-white flex items-center justify-center text-xs font-bold">
          F
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-800 truncate">Finkan Agustina</p>
          <p className="text-[10px] text-slate-400">Frontend Admin</p>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 font-medium group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
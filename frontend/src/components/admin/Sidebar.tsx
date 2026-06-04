import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Tag, 
  LogOut,
  Users,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../../api/axios";
import NotificationBell from "./NotificationBell";

// 1. IMPORT LOGO BARU KAMU
// Pastikan kamu sudah mendownload/menyimpan gambar logo kamera telur ceplok tersebut 
// ke dalam folder aset kamu, misalnya: frontend/src/assets/logo-foodiegram.jpg
import LogoFoodieGram from "../../assets/logo.jpeg"; 

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState<string>("Admin"); 

  const fetchAdminProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      if (res.data?.username) {
        setAdminName(res.data.username);
      }
    } catch (error) {
      console.error("Gagal mengambil nama admin di sidebar:", error);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const menuItems = [
    {   
      title: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      title: "Verifikasi Resep", 
      path: "/admin/verify", 
      icon: <ClipboardCheck size={20} />
    },
    { 
      title: "Control Resep", 
      path: "/admin/resep", 
      icon: <Utensils size={20} />
    },
    { 
      title: "Kategori", 
      path: "/admin/kategori", 
      icon: <Tag size={20} /> 
    },
    { 
      title: "Manajemen Pengguna", 
      path: "/admin/users", 
      icon: <Users size={20} />
    },
  ];

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("authToken"); 
      localStorage.removeItem("userRole");
      navigate("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm overflow-hidden">
      
      {/* Logo Section - Sudah Diperbarui dengan Gambar Kamera Telur Ceplok Asli */}
      <div className="p-6 flex flex-col items-center gap-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Tag Img Pengganti CSS Artwork Telur Lama */}
          <img 
            src={LogoFoodieGram} 
            alt="FoodieGram Logo" 
            className="w-11 h-11 object-contain rounded-xl"
            onError={(e) => {
              // Fallback jikalau lokasi import file gambar keliru saat development
              console.error("Gagal memuat gambar logo, pastikan path file import sudah benar.");
            }}
          />
          <h1 className="font-extrabold text-2xl tracking-tight text-slate-800">
            Foodie<span className="text-[#F27F22]">Gram</span>
          </h1>
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-[2px] font-medium text-center w-full">Media Sosial Resep</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
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
              <span className="font-medium flex-1">{item.title}</span>
            </Link>    
          );
        })}
      </nav>

      {/* Area Bawah - Dikunci di Dasar Layar */}
      <div className="mt-auto flex-shrink-0 bg-white">
        {/* Utilities Section - Lonceng Notifikasi Aktif */}
        <div className="px-6 py-2 flex justify-center border-t border-slate-50 pt-3">
          <NotificationBell />
        </div>

        {/* Profile Admin Card */}
        <Link 
          to="/admin/profile"
          className={cn(
            "mx-4 p-3 rounded-xl flex items-center gap-3 transition-all duration-300 mb-2 border",
            location.pathname === "/admin/profile"
              ? "bg-orange-50 border-orange-200 text-[#F27F22]"
              : "bg-slate-50 border-transparent text-slate-800 hover:bg-slate-100/80"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#F27F22] text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold truncate">{adminName}</p> 
            <p className="text-[10px] text-slate-400 font-medium">Frontend Admin</p>
          </div>
        </Link>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 font-medium group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Tag, 
  LogOut, 
  ChefHat 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      title: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      title: "Semua Resep", 
      path: "/admin/resep", 
      icon: <Utensils size={20} /> 
    },
    { 
      title: "Kategori", 
      path: "/admin/kategori", 
      icon: <Tag size={20} /> 
    },
  ];

  const handleLogout = () => {
    // Tambahkan konfirmasi sederhana
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    
    if (confirmLogout) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
    
      navigate("/admin/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-50">
        <div className="bg-orange-100 p-2 rounded-lg">
          <ChefHat className="text-[#F27F22]" size={24} />
        </div>
        <span className="font-bold text-xl text-slate-800">
          Foodie<span className="text-[#F27F22]">Gram</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname === item.path
                ? "bg-orange-50 text-[#F27F22] font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Logout Button Section */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-medium"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
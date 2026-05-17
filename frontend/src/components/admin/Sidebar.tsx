import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Tag, 
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

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
  title: "Profil",
  path: "/admin/profile",
  icon: <User size={20} />, // Pastikan User sudah di-import dari lucide-react
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm">
      {/* Logo Section */}
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

      <div className="px-6 py-2 flex justify-center border-t border-slate-50 pt-4">
        <NotificationBell />
      </div>

      {/* Profile Admin */}
      <div className="px-6 py-4 bg-slate-50 mx-4 rounded-xl mb-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F27F22] text-white flex items-center justify-center text-xs font-bold shadow-sm">
          F
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-800 truncate">Finkan Agustina</p>
          <p className="text-[10px] text-slate-400 font-medium">Frontend Admin</p>
        </div>
      </div>

      {/* Logout Button */}
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
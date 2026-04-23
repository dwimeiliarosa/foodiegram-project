import { useState } from "react";
import { 
  LayoutDashboard, 
  Utensils, 
  Tags, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State untuk mobile menu

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { title: "Semua Resep", icon: <Utensils size={20} />, path: "/admin/resep" },
    { title: "Kategori", icon: <Tags size={20} />, path: "/admin/kategori" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/admin/login");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Tombol Toggle Mobile (Hanya muncul di layar HP) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-[#F27F22] text-white rounded-lg shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay Hitam saat Sidebar terbuka di HP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Utama */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-lg">
                <Utensils className="text-[#F27F22]" size={24} />
             </div>
             <span className="text-xl font-bold text-slate-800 tracking-tight">
                Foodie<span className="text-[#F27F22]">Gram</span>
             </span>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.title}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false); // Tutup sidebar setelah klik di HP
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-orange-50 text-[#F27F22] font-semibold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
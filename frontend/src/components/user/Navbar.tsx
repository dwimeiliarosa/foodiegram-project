import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Fungsi untuk cek apakah path ini aktif
  const getStyle = (path: string) => 
    location.pathname === path ? "text-orange-500" : "text-slate-400";

  const getStroke = (path: string) => 
    location.pathname === path ? 2.5 : 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-5 flex justify-between items-center z-50">
      <Home 
        className={`${getStyle('/')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/')}
        onClick={() => navigate("/")} 
      />
      <Search 
        className={`${getStyle('/search')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/search')}
        onClick={() => navigate("/search")} 
      />
      <PlusSquare 
        className={`${getStyle('/upload')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/upload')}
        onClick={() => navigate("/upload")} 
      />
      <Bell 
        className={`${getStyle('/notifications')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/notifications')}
        onClick={() => navigate("/notifications")} 
      />
      <User 
        className={`${getStyle('/profile')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/profile')}
        onClick={() => navigate("/profile")} 
      />
    </div>
  );
};

export default Navbar;
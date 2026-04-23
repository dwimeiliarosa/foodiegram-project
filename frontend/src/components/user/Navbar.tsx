import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe">
      {/* Container max-w-md agar ikon tidak terlalu melebar di layar besar */}
      <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Home */}
        <Link 
          to="/" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/') ? 'text-[#F17228] scale-110' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home size={28} strokeWidth={isActive('/') ? 2.5 : 2} />
        </Link>

        {/* Search */}
        <Link 
          to="/search" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/search') ? 'text-[#F17228] scale-110' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search size={28} strokeWidth={isActive('/search') ? 2.5 : 2} />
        </Link>

        {/* TOMBOL UPLOAD (DI TENGAH) */}
        <Link 
          to="/upload" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/upload') ? 'text-[#F17228] scale-110' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PlusSquare size={32} strokeWidth={isActive('/upload') ? 2.5 : 2} />
        </Link>

        {/* Notifications */}
        <Link 
          to="/notifications" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/notifications') ? 'text-[#F17228] scale-110' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell size={28} strokeWidth={isActive('/notifications') ? 2.5 : 2} />
        </Link>

        {/* Profile */}
        <Link 
          to="/profile" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/profile') ? 'text-[#F17228] scale-110' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User size={28} strokeWidth={isActive('/profile') ? 2.5 : 2} />
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State baru untuk menyimpan jumlah notifikasi yang belum dibaca
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const token = localStorage.getItem("authToken") || localStorage.getItem("authtoken");

  // --- 1. LOGIKA HITUNG BADGE NOTIFIKASI SECARA REAL-TIME ---
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes/notifications', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Menyaring notifikasi yang memiliki is_read === false atau 0
          const unreadItems = data.filter((notif: any) => notif.is_read === false || notif.is_read == 0);
          setUnreadCount(unreadItems.length);
        }
      } catch (err) {
        console.error("Gagal menghitung badge notifikasi:", err);
      }
    };

    if (token) {
      fetchUnreadCount();
      // Polling setiap 15 detik agar angka ter-update otomatis jika ada aktivitas baru
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [token, location.pathname]);

  // Fungsi bawaan aslimu untuk cek gaya keaktifan menu
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
      {/* Mempertahankan rute asli bawaanmu yaitu /upload */}
      <PlusSquare 
        className={`${getStyle('/upload')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/upload')}
        onClick={() => navigate("/upload")} 
      />
      
      {/* PEMBUNGKUS ICON BELL UNTUK BADGE ANGKA */}
      <div className="relative flex items-center justify-center">
        <Bell 
          className={`${getStyle('/notifications')} cursor-pointer`} 
          size={28} strokeWidth={getStroke('/notifications')}
          onClick={() => navigate("/notifications")} 
        />
        {/* Balon Badge Oranye akan muncul di pojok kanan atas icon lonceng jika unreadCount > 0 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center pointer-events-none">
            {unreadCount}
          </span>
        )}
      </div>

      <User 
        className={`${getStyle('/profile')} cursor-pointer`} 
        size={28} strokeWidth={getStroke('/profile')}
        onClick={() => navigate("/profile")} 
      />
    </div>
  );
};

export default Navbar;
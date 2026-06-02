import React, { useState, useEffect } from "react";
import { Bell, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      // Menyesuaikan segment routing endpoint Swagger Notifications
      const res = await api.get("/recipes/notifications");
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Gagal mengambil data notifikasi:", err);
    }
  };

  const handleMarkAsRead = async (id: number, recipeId: number | null) => {
    try {
      setLoading(true);
      // 1. Jalankan API Put Update Status Baca dari Swagger Dwi
      await api.put(`/recipes/notifications/${id}/read`);
      
      // 2. Refresh data notifikasi internal
      await fetchNotifications();
      
      // 3. Tutup modal penampil
      setIsNotifModalOpen(false); 

      // 4. Deteksi Navigasi Kondisional: Jika berurusan dengan resep, lempar ke antrean verifikasi
      if (recipeId) {
        navigate("/admin/verify", { state: { highlightRecipeId: recipeId } });
      } else {
        // Jika notifikasi user baru mendaftar (recipe_id null), arahkan ke Dashboard
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Gagal memperbarui status baca notifikasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling berkala
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsNotifModalOpen(true)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isNotifModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[500px]">
            
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-base">Pusat Notifikasi Sistem</span>
                {loading && <Loader2 className="animate-spin text-slate-400" size={14} />}
              </div>
              <button 
                onClick={() => setIsNotifModalOpen(false)} 
                className="text-slate-400 hover:text-slate-800 font-bold p-1 hover:bg-slate-100 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto p-3 space-y-2 flex-1">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">Tidak ada riwayat notifikasi masuk.</div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, n.recipe_id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                      !n.is_read ? "bg-orange-50/70 border-orange-200 hover:bg-orange-50" : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-1.5 rounded-xl mt-0.5 h-fit ${!n.is_read ? "bg-[#F27F22] text-white" : "bg-slate-200 text-slate-500"}`}>
                        <Info size={14} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{n.message}</p>
                        <span className="text-[9px] text-slate-400 block font-semibold">
                          {new Date(n.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
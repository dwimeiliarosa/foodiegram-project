import { useState, useEffect } from "react";
import { Bell, Info, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Untuk pindah halaman
import api from "../../api/axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/recipes/notifications");
      const data = res.data.data || res.data;
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Gagal ambil notifikasi", err);
    }
  };

  const handleMarkAsRead = async (id: number, recipeId: number) => {
  try {
    // 1. API Dwi
    await api.put(`/recipes/notifications/${id}/read`);
    
    // 2. Update data
    fetchNotifications();
    
    // 3. TUTUP MODAL DAFTAR NOTIFIKASI
    setIsNotifModalOpen(false); 

    // 4. PINDAH KE KONTROL RESEP
    navigate("/admin/resep", { state: { highlightRecipeId: recipeId } });
  } catch (err) {
    console.error("Gagal update status baca", err);
  }
};

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
  <div className="relative">
    {/* Tombol Lonceng */}
    <button 
      onClick={() => setIsNotifModalOpen(true)} // Langsung buka modal besar
      className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
          {unreadCount}
        </span>
      )}
    </button>

    {/* MODAL NOTIFIKASI (Tengah Layar) */}
    {isNotifModalOpen && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-lg text-gray-800">Semua Notifikasi</h3>
            <button onClick={() => setIsNotifModalOpen(false)} className="text-gray-500 hover:text-black">
              ✕
            </button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Tidak ada notifikasi</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.recipe_id)} // Panggil fungsi ini
                  className={`p-4 mb-2 rounded-xl cursor-pointer transition-all border ${
                    !n.is_read ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-full h-fit ${!n.is_read ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(n.created_at).toLocaleString('id-ID')}
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
};

export default NotificationBell;
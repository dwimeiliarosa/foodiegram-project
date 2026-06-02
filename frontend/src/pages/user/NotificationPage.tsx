import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const token = localStorage.getItem("authToken") || localStorage.getItem("authtoken");

  // --- 1. AMBIL DATA DARI BACKEND (URL SUDAH DIPERBAIKI) ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes/notifications', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal mengambil data notifikasi:", err);
      }
    };

    if (token) fetchNotifications();
  }, [token]);

  // --- 2. FUNGSI KLIK & TANDAI SUDAH DIBACA ---
  const handleNotifClick = async (id: number, type: string, recipeId?: number) => {
    try {
      await fetch(`http://localhost:5000/api/recipes/notifications/${id}/read`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );

      // Jika ada rujukan id resep, arahkan pengguna ke detail resep tersebut
      if (recipeId) {
        navigate(`/recipe/${recipeId}`);
      }
    } catch (err) {
      console.error("Gagal update status baca:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-white">
      {/* HEADER ATAS */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
      </div>

      {/* LIST KONTEN NOTIFIKASI */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => handleNotifClick(notif.id, notif.type, notif.recipe_id)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.is_read ? "bg-white border-slate-100" : "bg-orange-50 border-orange-200"
              }`}
            >
              <div className="flex items-center flex-1">
                {/* Avatar Lonceng Fleksibel menggantikan Tanda Tanya */}
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-3 text-lg">
                  🔔
                </div>
                
                {/* Sinkronisasi Kolom Pesan PostgreSQL Backend */}
                <div>
                  <p className="text-sm text-slate-800 font-medium">
                    {notif.message || "Ada interaksi baru pada resep Anda!"}
                  </p>
                  {notif.created_at && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(notif.created_at).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              {/* Gambar Resep di Kanan (jika disediakan oleh endpoint backend) */}
              {notif.recipe_image && (
                <img 
                  src={notif.recipe_image} 
                  alt="resep" 
                  className="w-12 h-12 rounded-lg object-cover ml-4 border border-slate-100"
                />
              )}
              
              {/* Indikator Oranye Status Belum Dibaca */}
              {!notif.is_read && (
                <div className="w-2 h-2 bg-orange-500 rounded-full ml-2"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400">Belum ada notifikasi baru.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
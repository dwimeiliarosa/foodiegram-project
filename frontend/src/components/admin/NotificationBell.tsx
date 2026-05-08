import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import api from "../../api/axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/recipes/notifications"); // Endpoint di Swagger
      const data = res.data.data || res.data;
      setNotifications(data);
      // Hitung yang is_read nya false
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Gagal ambil notifikasi", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Opsional: Polling setiap 30 detik agar real-time
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative cursor-pointer p-2">
      <Bell size={24} className="text-slate-600" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
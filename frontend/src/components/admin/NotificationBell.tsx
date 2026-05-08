import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../../api/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const data = res.data.data || res.data;
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Gagal ambil notifikasi", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Opsional: Polling setiap 30 detik agar update otomatis
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Gagal update status baca", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 outline-none">
        <Bell className="h-6 w-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white p-2 shadow-lg border">
        <h4 className="font-bold p-2 border-b text-sm">Notifikasi</h4>
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-xs text-slate-500">Tidak ada notifikasi</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem 
              key={n.id} 
              className={cn(
                "p-3 cursor-pointer flex flex-col items-start gap-1 border-b last:border-0",
                !n.is_read ? "bg-blue-50" : "bg-white"
              )}
              onClick={() => markAsRead(n.id)}
            >
              <p className="text-xs leading-relaxed">{n.message}</p>
              <span className="text-[10px] text-slate-400">
                {new Date(n.created_at).toLocaleString('id-ID')}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Pastikan kamu pakai lucide-react untuk ikon

const NotificationPage = () => {
  const navigate = useNavigate();

  // Fungsi untuk kembali ke halaman sebelumnya
  const handleBack = () => {
    navigate(-1); // Ini akan membawa user ke halaman terakhir sebelum notifikasi
  };

  const notifications = [
    { id: 1, user: "Dwi Backend", action: "menyukai resep kamu", time: "2 menit yang lalu" },
    { id: 2, user: "Pointer Admin", action: "mengikuti kamu", time: "1 jam yang lalu" },
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      {/* Header dengan Tombol Kembali */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 text-orange-600 font-bold">
              {notif.user[0]}
            </div>
            <div>
              <p className="text-sm text-slate-800">
                <span className="font-bold">{notif.user}</span> {notif.action}
              </p>
              <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;
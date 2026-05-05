import { useState, useEffect } from "react";
import { ChevronLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken") || localStorage.getItem("authtoken");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- FIX NAVBAR (Paling Akurat) ---
  useEffect(() => {
    // Sembunyikan semua elemen navigasi (nav atau div dengan class nav)
    const navs = document.querySelectorAll('nav, [class*="nav"], [class*="Navbar"]');
    navs.forEach((el) => {
      if (el instanceof HTMLElement) el.style.setProperty("display", "none", "important");
    });
    
    return () => {
      navs.forEach((el) => {
        if (el instanceof HTMLElement) el.style.setProperty("display", "flex", "important");
      });
    };
  }, []);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsername(data.username || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
        const formattedPhoto = data.photo_url ? data.photo_url.replace("127.0.0.1", "localhost") : "/avatar.png";
        setPreview(formattedPhoto);
      } catch (err) {
        console.error("Gagal load profile:", err);
      }
    };
    fetchCurrentProfile();
  }, [token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("location", location);
    if (selectedFile) {
      formData.append("photo", selectedFile); 
    }

    try {
      // PERUBAHAN DISINI: Ganti PUT menjadi POST karena PUT memberikan error 404
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "POST", 
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        body: formData,
      });

      if (response.ok) {
        alert("Profil berhasil diperbarui!");
        navigate("/profile");
      } else {
        const errorText = await response.text();
        console.log("Full Error:", errorText);
        alert("Gagal memperbarui: Cek apakah route POST /api/auth/profile sudah ada di backend.");
      }
    } catch (error) {
      console.error("Koneksi gagal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative z-[999]">
      <header className="p-4 flex items-center justify-between border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-all">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-lg font-bold">Edit Profil</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`${loading ? 'text-gray-400' : 'text-orange-500'} font-bold text-sm`}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 bg-gray-200 rounded-full border-2 border-orange-500 overflow-hidden shadow-md">
              <img 
                src={preview || "/avatar.png"} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                onError={(e) => e.currentTarget.src = "/avatar.png"}
              />
            </div>
            <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-orange-600 transition-all border-2 border-white">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <p className="mt-3 text-sm text-gray-500 font-medium">Ubah Foto Profil</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Lokasi</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
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

  // --- FIX NAVBAR ---
  useEffect(() => {
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

  // --- AMBIL DATA PROFIL SAAT INI ---
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
      // --- TAMBAHKAN LOGIKA INI ---
      const maxSizeInMB = 1; // Tentukan limit di sini, misal 1MB
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        alert(`Ukuran foto terlalu besar! Maksimal ${maxSizeInMB}MB.`);
        // Reset input file agar user bisa pilih lagi
        e.target.value = ""; 
        return;
      }
      // ----------------------------

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  // --- FUNGSI SIMPAN (LOGIKA BARU) ---
  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. UPDATE DATA TEKS (Username & Bio)
      const resProfile = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: username,
          bio: bio,
          location: location
        }),
      });

      // 2. UPDATE FOTO (Jika ada file baru yang dipilih)
      if (selectedFile) {
        const formData = new FormData();
        // Sesuai saran: "avatar" harus sesuai dengan request backend Dwi
        formData.append("image", selectedFile); 

        const resAvatar = await fetch("http://localhost:5000/api/auth/update-avatar", {
          method: "PUT",
          headers: { 
            // PENTING: Jangan isi Content-Type di sini agar browser yang mengaturnya
            Authorization: `Bearer ${token}` 
          },
          body: formData,
        });

        if (!resAvatar.ok) {
          const errorFoto = await resAvatar.json();
          console.error("Gagal upload foto:", errorFoto);
          alert("Gagal memperbarui foto profil, tetapi data teks berhasil disimpan.");
        }
      }

      if (resProfile.ok) {
        alert("Profil berhasil diperbarui!");
        navigate("/profile");
      } else {
        const errorData = await resProfile.json();
        alert(errorData.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Koneksi gagal:", error);
      alert("Terjadi kesalahan koneksi ke server");
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

      
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
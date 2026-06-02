import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; 
import api from "../../api/axios"; 

interface UserData {
  username: string;
  photo_profile: string;
  bio: string;
}

interface Stats {
  posts: number;
  followers: number;
  following: number;
}

// Helper URL Gambar - Disesuaikan dengan folder 'recipes' di MinIO kamu
const getProfileImageUrl = (url: string) => {
  if (!url) return "https://api.dicebear.com/7.x/initials/svg?seed=User"; 
  
  if (url.startsWith('http')) {
    return url.replace("127.0.0.1", "localhost");
  }
  
  // Jika hanya nama file, langsung arahkan ke path recipes MinIO / Express
  return `http://localhost:5000/uploads/recipes/${url}`; 
};

const getRecipeImageUrl = (url: string) => {
  if (!url) return "https://placehold.co/600x400?text=No+Image";
  if (url.startsWith('http')) return url.replace("127.0.0.1", "localhost");
  return `http://localhost:5000/uploads/recipes/${url}`; 
};

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const [userData, setUserData] = useState<UserData>({ username: "", photo_profile: "", bio: "" });
  const [stats, setStats] = useState<Stats>({ posts: 0, followers: 0, following: 0 });
  const [content, setContent] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [followLoading, setFollowLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [resRecipes, resStats, resFollowingList] = await Promise.all([
          api.get(`/recipes/user/${id}`).catch((err) => {
            console.error("Gagal mengambil resep user:", err);
            return { data: null };
          }), 
          api.get(`/recipes/stats?userId=${id}`).catch((err) => {
            console.error("Gagal mengambil stats user:", err);
            return { data: null };
          }),
          api.get(`/recipes/following`).catch(() => ({ data: [] }))
        ]);

        // 👇 ADALAH SISI TEMPAT MENARUH KODE CONSOLE.LOG NYA, WANDA:
        console.log("=== DEBUG DATA BACKEND ===");
        console.log("Output resStats dari Dwi:", resStats?.data);
        console.log("Output semua resep dari Dwi:", resRecipes?.data);

        // === 1. PROSES EKSTRAKSI DATA RESEP ===
        let recipeData: any[] = [];
        if (resRecipes && resRecipes.data) {
          if (Array.isArray(resRecipes.data)) {
            recipeData = resRecipes.data;
          } else if (resRecipes.data.recipes && Array.isArray(resRecipes.data.recipes)) {
            recipeData = resRecipes.data.recipes;
          } else if (resRecipes.data.data && Array.isArray(resRecipes.data.data)) {
            recipeData = resRecipes.data.data;
          }
        }
        setContent(recipeData);
        
        // ... sisa kode di bawahnya tetap sama
        // === 2. DETEKTIF DATA FOTO PROFIL (PERBAIKAN - ANTI AMBIL GAMBAR MAKANAN) ===
        let extractedUsername = `User ${id}`;
        let extractedBio = "Halo! Saya suka memasak.";
        let extractedPhoto = "";

        console.log("Isi data resStats dari backend:", resStats?.data);
        console.log("Isi data resep pertama dari backend:", recipeData[0]);

        // Prioritas 1: Ambil data info user murni dari endpoint statistik
        if (resStats && resStats.data) {
          const sData = resStats.data;
          extractedUsername = sData.username || sData.User?.username || extractedUsername;
          extractedBio = sData.bio || sData.User?.bio || extractedBio;
          extractedPhoto = sData.photo_profile || sData.avatar || sData.User?.photo_profile || sData.User?.avatar || "";
        }

        // Prioritas 2: Jika dari stats kosong, baru intip relasi User di resep pertama (BUKAN image_url resepnya)
        if (!extractedPhoto && recipeData.length > 0) {
          const firstRecipe = recipeData[0];
          extractedUsername = firstRecipe.User?.username || firstRecipe.username || extractedUsername;
          extractedBio = firstRecipe.User?.bio || firstRecipe.bio || extractedBio;
          // Mengambil properti profile user asli, tidak akan fallback ke image_url resep makanan lagi
          extractedPhoto = firstRecipe.User?.photo_profile || firstRecipe.User?.avatar || firstRecipe.photo_profile || "";
        }

        // Simpan ke state
        setUserData({
          username: extractedUsername,
          bio: extractedBio,
          photo_profile: extractedPhoto
        });

        // === 3. LOGIKA EKSTRAKSI ANGKA STATISTIK ===
        if (resStats && resStats.data) {
          setStats({
            posts: parseInt(resStats.data.total_posts || resStats.data.posts) || 0,
            followers: parseInt(resStats.data.total_followers || resStats.data.followers) || 0,
            following: parseInt(resStats.data.total_following || resStats.data.following) || 0
          });
        }

        // === 4. LOGIKA VALIDASI HUBUNGAN FOLLOW ===
        if (resFollowingList && Array.isArray(resFollowingList.data)) {
          const alreadyFollowed = resFollowingList.data.some(
            (followItem: any) => Number(followItem.id) === Number(id)
          );
          setIsFollowing(alreadyFollowed);
        }

      } catch (error) {
        console.error("Gagal memproses data komponen profil:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfileData();
  }, [id]);

  // === PERBAIKAN FUNGSI HANDLE FOLLOW TOGGLE (DENGAN BEARER TOKEN) ===
  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      // Ambil token dari localStorage untuk dikirim ke backend Dwi
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/recipes/follow", 
        { following_id: Number(id) },
        {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        const newFollowState = !isFollowing;
        setIsFollowing(newFollowState);
        
        setStats(prev => ({
          ...prev,
          followers: newFollowState ? prev.followers + 1 : Math.max(0, prev.followers - 1)
        }));

        alert(`Berhasil ${newFollowState ? "mengikuti" : "berhenti mengikuti"} @${userData.username}`);
      }
    } catch (error: any) {
      console.error("Error saat melakukan Follow Toggle:", error.response?.data);
      alert(error.response?.data?.message || "Aksi follow gagal dikirim ke server backend.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-orange-500 font-bold italic">Memuat halaman...</div>;

  return (
    <div className="profile-container p-4 max-w-2xl mx-auto bg-white min-h-screen">
      {/* Tombol Kembali */}
      <button onClick={() => window.history.back()} className="mb-6 flex items-center text-gray-600 font-medium hover:text-orange-500 transition">
        ← Kembali
      </button>

      {/* Bagian Atas: Info Profil */}
      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-orange-100 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
            {userData.photo_profile ? (
              <img 
                src={getProfileImageUrl(userData.photo_profile)} 
                alt="Profil" 
                className="w-full h-full object-cover" 
              />
            ) : (
              // Jika data foto profil kosong, berikan placeholder avatar inisial nama dari dicebear
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`} 
                alt="Profil Cadangan" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">@{userData.username}</h2>
            <p className="text-gray-500 text-sm mt-1 whitespace-pre-line">{userData.bio}</p>
          </div>
        </div>

        {/* Angka Statistik */}
        <div className="flex gap-6 text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <div className="font-bold text-base text-gray-800">{stats.posts}</div>
            <div className="text-[10px] text-gray-400 font-semibold tracking-wider">RESEP</div>
          </div>
          <div>
            <div className="font-bold text-base text-gray-800">{stats.followers}</div>
            <div className="text-[10px] text-gray-400 font-semibold tracking-wider">FOLLOWERS</div>
          </div>
          <div>
            <div className="font-bold text-base text-gray-800">{stats.following}</div>
            <div className="text-[10px] text-gray-400 font-semibold tracking-wider">FOLLOWING</div>
          </div>
        </div>
      </div>

      {/* Tombol Follow */}
      <div className="mt-4">
        <button
          onClick={handleFollowToggle}
          disabled={followLoading}
          className={`px-6 py-2 rounded-xl font-bold text-sm w-36 shadow-sm transition-all duration-200 ${
            isFollowing 
              ? "bg-gray-100 text-gray-800 border hover:bg-gray-200" 
              : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
          }`}
        >
          {followLoading ? "..." : isFollowing ? "Mengikuti" : "Ikuti"}
        </button>
      </div>

      {/* Grid Postingan Resep */}
      <div className="mt-8">
        <div className="flex justify-center border-b mb-6">
          <span className="border-b-2 border-orange-500 pb-2 px-6 font-bold text-orange-500 tracking-wide text-sm">
            📋 RESEP
          </span>
        </div>

        {content.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
            User ini belum memiliki postingan.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {content.map((recipe: any) => (
              <Link 
                to={`/recipe/${recipe.id}`} 
                key={recipe.id} 
                className="aspect-square border border-gray-100 bg-gray-50 rounded-xl overflow-hidden hover:opacity-80 transition cursor-pointer shadow-sm block relative group"
              >
                <img 
                  src={getRecipeImageUrl(recipe.image_url)} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
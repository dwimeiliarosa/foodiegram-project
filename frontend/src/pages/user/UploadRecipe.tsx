import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const UploadRecipe = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  // Fungsi menangani pemilihan file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Buat preview sementara
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !title) return alert("Isi judul dan pilih foto dulu ya!");

    // Menyiapkan data untuk dikirim ke Backend
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', selectedImage);

    try {
      // Gunakan endpoint upload-test sesuai dokumentasi Swagger kamu
      const response = await fetch('http://localhost:5000/api/auth/upload-test', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Hore! Foto berhasil masuk ke bucket foodiegram!");
        // Reset form
        setTitle('');
        setSelectedImage(null);
        setPreviewUrl(null);
      } else {
        alert("Gagal upload. Cek apakah MinIO & Backend sudah jalan.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Bagikan Resepmu</h1>
      
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Area Upload Foto */}
        <div className="relative w-full h-64 bg-white border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => {setPreviewUrl(null); setSelectedImage(null);}}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center cursor-pointer">
              <Camera size={48} className="text-slate-400 mb-2" />
              <span className="text-slate-500 font-medium">Klik untuk pilih foto</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* Input Judul */}
        <input 
          type="text" 
          placeholder="Judul Resep (Contoh: Macaron Almond)"
          className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Tombol Kirim */}
        <button 
          type="submit"
          className="w-full bg-[#F17228] text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={20} />
          Posting Sekarang
        </button>
      </form>
    </div>
  );
};

export default UploadRecipe;
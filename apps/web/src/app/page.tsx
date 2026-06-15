export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50/50 py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Akademik
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm sm:text-base">
            Selamat datang di Sistem Informasi Akademik. Kelola data perkuliahan, registrasi mahasiswa, dosen, serta pengisian Kartu Rencana Studi (KRS) dengan mudah dan efisien.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">👥</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">1,240</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">↑ 12 mahasiswa baru hari ini</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dosen</span>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">👨‍🏫</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">84</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Status aktif mengajar</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KRS Diajukan</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">📝</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">92%</p>
            <p className="text-xs text-amber-600 font-medium mt-1">Menunggu persetujuan dosen wali</p>
          </div>
        </div>

        {/* Quick Actions & Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Menu */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Akses Cepat Layanan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block">🎓</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Portal Mahasiswa</h3>
                <p className="text-xs text-slate-500 mt-1">Kelola data profil, lihat transkrip nilai, dan cetak KHS.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block">📅</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Pengisian KRS</h3>
                <p className="text-xs text-slate-500 mt-1">Pilih mata kuliah untuk semester aktif secara online.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block">📋</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Portal Dosen</h3>
                <p className="text-xs text-slate-500 mt-1">Input nilai mahasiswa, bimbingan akademik, dan jadwal mengajar.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block">⚙️</span>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Konfigurasi Akademik</h3>
                <p className="text-xs text-slate-500 mt-1">Kelola data program studi, kurikulum, dan tahun ajaran.</p>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl">
            <div>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10">
                Pengumuman Terbaru
              </span>
              <h3 className="text-xl font-bold mt-4 mb-2 leading-snug">
                Batas Pengisian KRS Semester Genap 2025/2026
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                Diinformasikan kepada seluruh mahasiswa bahwa batas akhir pengisian dan persetujuan KRS adalah tanggal 25 Juni 2026. Pastikan Anda telah menyelesaikan pembayaran administrasi.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Diperbarui 1 jam yang lalu</span>
              <a href="#" className="text-white font-medium hover:underline">Detail →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
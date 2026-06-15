export default function About() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Tentang SiAkad
        </h1>
        <p className="text-slate-600 leading-relaxed">
          SiAkad (Sistem Informasi Akademik) adalah platform manajemen data akademik perguruan tinggi yang dirancang untuk memenuhi penilaian Ujian Akhir Semester (UAS) mata kuliah Sistem Basis Data. Platform ini mempermudah pencatatan informasi mahasiswa, dosen, kelas, kurikulum, serta kartu rencana studi (KRS) secara dinamis.
        </p>
        <div className="mt-6 flex gap-4">
          <a href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}

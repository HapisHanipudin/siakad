export default function Contact() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Pusat Bantuan SiAkad
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Jika Anda mengalami kesulitan saat mengoperasikan portal akademik, silakan hubungi tim administrator program studi atau unit Teknologi Informasi kampus.
        </p>
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-2 text-sm text-slate-500">
          <p>📧 Email Support: <span className="font-semibold text-slate-700">support@siakad.ac.id</span></p>
          <p>📞 Telepon: <span className="font-semibold text-slate-700">(021) 123-4567</span></p>
        </div>
        <div className="mt-8 flex gap-4">
          <a href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}

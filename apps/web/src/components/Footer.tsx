export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} SiAkad - Sistem Informasi Akademik. Semua Hak Dilindungi.</p>
        <p className="mt-1">Dibuat untuk UAS Sistem Basis Data</p>
      </div>
    </footer>
  );
}
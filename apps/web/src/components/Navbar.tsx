import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SiAkad
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              V1.0.0-Beta
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-indigo-600 transition-colors no-underline">
            Beranda
          </Link>
          <Link href="/mahasiswa" className="hover:text-indigo-600 transition-colors no-underline">
            Mahasiswa
          </Link>
          <Link href="/krs" className="hover:text-indigo-600 transition-colors no-underline">
            KRS
          </Link>
          <Link href="/dosen" className="hover:text-indigo-600 transition-colors no-underline">
            Dosen
          </Link>
          <Link href="/admin" className="hover:text-indigo-600 transition-colors no-underline">
            Admin (Kelas)
          </Link>
          <Link href="/admin/laporan" className="hover:text-indigo-600 transition-colors no-underline">
            Laporan
          </Link>
        </div>
      </div>
    </nav>
  );
}
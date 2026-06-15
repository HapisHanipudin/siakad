import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SiAkad - Sistem Informasi Akademik",
	description: "Sistem Informasi Akademik Terintegrasi untuk UAS Sistem Basis Data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      {/* Tambahkan class min-h-screen dan flex flex-col agar footer selalu di bawah */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />          {/* <--- PASANG NAVBAR DI SINI */}
        
        <main className="flex-grow">
          {children}        {/* <--- Isi halaman akan muncul di sini */}
        </main>
        
        <Footer />          {/* <--- PASANG FOOTER DI SINI */}
      </body>
    </html>
  );
}
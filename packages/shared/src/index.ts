// Shared types antara web dan api
export type Mahasiswa = {
  id: string;
  nama: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type Dosen = {
  id: string;
  nama: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type Krs = {
  id: string;
  mahasiswaId: string;
  tahunAjaran: string;
  semester: string;
  mataKuliah: {
    kodeMk: string;
    namaMk: string;
    sks: number;
  }[];
  createdAt: string;
};

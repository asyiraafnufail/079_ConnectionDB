import { Sequelize, DataTypes } from "sequelize";
import "dotenv/config";

// Inisialisasi Sequelize (MySQL)
export const sequelize = new Sequelize(
  process.env.DB_NAME || "mahasiswa",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false, // set true kalau mau lihat SQL di console
  }
);

// Definisi Model Biodata
export const Biodata = sequelize.define(
  "Biodata",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nama wajib diisi" },
      },
    },
    nim: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: { name: "uniq_nim", msg: "NIM sudah terdaftar" },
      validate: {
        notEmpty: { msg: "NIM wajib diisi" },
        len: { args: [5, 20], msg: "Panjang NIM minimal 5 karakter" }
      },
    },
    kelas: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Kelas wajib diisi" },
      },
    },
  },
  {
    tableName: "biodata",     // nama tabel
    timestamps: false,        // nonaktifkan createdAt/updatedAt
    underscored: false,
  }
);

// (Opsional) Seeder ringan kalau tabel kosong
export async function seedIfEmpty() {
  const count = await Biodata.count();
  if (count === 0) {
    await Biodata.bulkCreate([
      { nama: "Aisyah Putri", nim: "20230140079", kelas: "TI-3A" },
      { nama: "Rafi Pratama", nim: "20230140110", kelas: "TI-3B" },
      { nama: "Nadia Salsabila", nim: "20230140045", kelas: "TI-3A" },
    ]);
  }
}

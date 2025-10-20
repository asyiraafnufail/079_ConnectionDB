import express from "express";
import pool from "./db.js";
import "dotenv/config";

const app = express();
app.use(express.json());

// Tes koneksi server
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "Express MySQL Connection", db: process.env.DB_NAME });
});

// GET semua biodata
app.get("/biodata", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, nim, kelas FROM biodata ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error SELECT:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET satu data berdasarkan ID
app.get("/biodata/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, nim, kelas FROM biodata WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error SELECT by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST tambah data baru
app.post("/biodata", async (req, res) => {
  try {
    const { nama, nim, kelas } = req.body;

    // Validasi sederhana
    if (!nama || !nim || !kelas) {
      return res
        .status(400)
        .json({ error: "Field nama, nim, dan kelas wajib diisi" });
    }

    // Simpan data
    const [result] = await pool.query(
      "INSERT INTO biodata (nama, nim, kelas) VALUES (?, ?, ?)",
      [nama, nim, kelas]
    );

    // Ambil data yang baru ditambahkan
    const [rows] = await pool.query(
      "SELECT id, nama, nim, kelas FROM biodata WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Data mahasiswa berhasil ditambahkan",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error INSERT:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "NIM sudah terdaftar" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Jalankan server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

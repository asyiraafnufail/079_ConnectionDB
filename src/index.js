import express from "express";
import "dotenv/config";
import { sequelize, Biodata, seedIfEmpty } from "./sequelize.js";

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ ok: true, orm: "Sequelize", db: process.env.DB_NAME });
});

// GET semua biodata
app.get("/biodata", async (_req, res) => {
  try {
    const rows = await Biodata.findAll({
      attributes: ["id", "nama", "nim", "kelas"],
      order: [["id", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    console.error("Error GET /biodata:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET by id
app.get("/biodata/:id", async (req, res) => {
  try {
    const row = await Biodata.findByPk(req.params.id, {
      attributes: ["id", "nama", "nim", "kelas"],
    });
    if (!row) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json(row);
  } catch (err) {
    console.error("Error GET /biodata/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST tambah data
app.post("/biodata", async (req, res) => {
  try {
    const { nama, nim, kelas } = req.body;
    if (!nama || !nim || !kelas) {
      return res.status(400).json({ error: "Field nama, nim, dan kelas wajib diisi" });
    }
    const created = await Biodata.create({ nama, nim, kelas });
    res.status(201).json({
      message: "Data mahasiswa berhasil ditambahkan",
      data: { id: created.id, nama: created.nama, nim: created.nim, kelas: created.kelas },
    });
  } catch (err) {
    console.error("Error POST /biodata:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: err.errors?.[0]?.message || "NIM sudah terdaftar" });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors?.[0]?.message || "Validasi gagal" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update data by id
app.put("/biodata/:id", async (req, res) => {
  try {
    const { nama, nim, kelas } = req.body;
    if (!nama && !nim && !kelas) {
      return res.status(400).json({ error: "Minimal satu field (nama/nim/kelas) harus diisi" });
    }
    const row = await Biodata.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Data tidak ditemukan" });

    // Update field yang dikirim
    if (nama !== undefined) row.nama = nama;
    if (nim !== undefined) row.nim = nim;
    if (kelas !== undefined) row.kelas = kelas;

    await row.save();
    res.json({ message: "Data diperbarui", data: { id: row.id, nama: row.nama, nim: row.nim, kelas: row.kelas } });
  } catch (err) {
    console.error("Error PUT /biodata/:id:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: err.errors?.[0]?.message || "NIM sudah terdaftar" });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors?.[0]?.message || "Validasi gagal" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE data by id
app.delete("/biodata/:id", async (req, res) => {
  try {
    const row = await Biodata.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Data tidak ditemukan" });
    await row.destroy();
    res.json({ message: "Data dihapus", id: Number(req.params.id) });
  } catch (err) {
    console.error("Error DELETE /biodata/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server setelah konek dan sync
const port = Number(process.env.PORT || 3000);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Terhubung ke MySQL via Sequelize");
    await sequelize.sync({ alter: true });
    console.log("✅ Sinkronisasi model selesai");
    await seedIfEmpty();
    app.listen(port, () => console.log(`🚀 Server berjalan di http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Gagal start:", err);
    process.exit(1);
  }
})();

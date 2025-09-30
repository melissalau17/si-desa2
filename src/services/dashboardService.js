const suratService = require("./suratService");
const laporanService = require("./laporanService");
const beritaService = require("./beritaService");
const userService = require("./userService");

exports.getDashboardData = async () => {
  try {
    const [permohonans, laporans, beritas, users] = await Promise.all([
      suratService.countAll(),
      laporanService.countAll(),
      beritaService.countAll(),
      userService.countAll(),
    ]);

    const [newPermohonans, newLaporans, newBeritas, newUsers] = await Promise.all([
      suratService.countNew(),
      laporanService.countNew(),
      beritaService.countNewThisWeek(),
      userService.countNewThisMonth(),
    ]);

    const activities = await exports.getLatestActivities();

    return {
      permohonans,
      newPermohonans,
      laporans,
      newLaporans,
      beritas: { total: beritas, newThisWeek: newBeritas },
      users: { total: users, newThisMonth: newUsers },
      activities,
    };
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    throw new Error("Failed to fetch dashboard data");
  }
};

exports.getLatestActivities = async () => {
  try {
    const [suratLatest, laporanLatest, beritaLatest] = await Promise.all([
      suratService.getLatest(2),
      laporanService.getLatest(2),
      beritaService.getLatest(2),
    ]);

    const activities = [
      ...suratLatest.map((s) => ({
        type: "permohonan",
        title: s.jenis_surat || "Tidak ada judul",
        time: s.createdAt || s.tanggal || new Date(),
      })),
      ...laporanLatest.map((l) => ({
        type: "laporan",
        title: l.keluhan || "Tidak ada judul",
        time: l.createdAt || new Date(),
      })),
      ...beritaLatest.map((b) => ({
        type: "berita",
        title: b.judul || "Tidak ada judul",
        time: b.createdAt || new Date(),
      })),
    ];

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
  } catch (err) {
    console.error("Error fetching latest activities:", err);
    return []; 
  }
};

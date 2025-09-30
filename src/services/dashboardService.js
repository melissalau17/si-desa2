const suratService = require("./suratService");
const laporanService = require("./laporanService");
const beritaService = require("./beritaService");
const userService = require("./userService");

exports.getDashboardData = async () => {
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

  const activities = await this.getLatestActivities();

  return {
    permohonans,
    newPermohonans,
    laporans,
    newLaporans,
    beritas: { total: beritas, newThisWeek: newBeritas },
    users: { total: users, newThisMonth: newUsers },
    activities,
  };
};

exports.getLatestActivities = async () => {
  const [suratLatest, laporanLatest, beritaLatest] = await Promise.all([
    suratService.getLatest(2),
    laporanService.getLatest(2),
    beritaService.getLatest(2),
  ]);

  return [
    ...suratLatest.map((s) => ({
      type: "permohonan",
      title: s.jenis_surat,
      time: s.createdAt,
    })),
    ...laporanLatest.map((l) => ({
      type: "laporan",
      title: l.keluhan,
      time: l.createdAt,
    })),
    ...beritaLatest.map((b) => ({
      type: "berita",
      title: b.judul,
      time: b.createdAt,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));
};

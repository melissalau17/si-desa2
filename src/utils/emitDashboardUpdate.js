const dashboardService = require("../services/dashboardService");

async function emitDashboardUpdate(io) {
  const updated = await dashboardService.getDashboardData();
  io.emit("dashboard:update", updated);
}

module.exports = emitDashboardUpdate;
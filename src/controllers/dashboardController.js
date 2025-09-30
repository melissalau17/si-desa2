const dashboardService = require("../services/dashboardService");

exports.getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

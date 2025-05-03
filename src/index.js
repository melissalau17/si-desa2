const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const keuanganRoutes = require("./routes/keuanganRoutes");
const beritaRoutes = require("./routes/beritaRoutes");
const laporanRoutes = require("./routes/laporanRoutes");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
  res.send("hello API");
});
app.use("/api/", userRoutes);
app.use("/api/", keuanganRoutes);
app.use("/api/", beritaRoutes);
app.use("/api/", laporanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API RUNNING SUCCESSFULLY ON PORT http://localhost:${PORT}`);
});

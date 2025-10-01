const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const beritaRoutes = require("./routes/beritaRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const suratRoutes = require("./routes/suratRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "https://admin-sidesa.vercel.app",
    "exp://",
    "exp+sistem-desa-mob://",
    "sistem-desa-mob://",
    "http://localhost:8081", 
    "http://localhost:19006",
];

const localhostRegex = /^http:\/\/localhost(:\d+)?$/;
const lanIpRegex = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\d*(\.\d+)*(:\d+)?$/;
const zeroHostRegex = /^http:\/\/0\.0\.0\.0(:\d+)?$/;

app.use(
    cors({
        origin: function (origin, callback) {
            if (
                !origin ||
                allowedOrigins.some(o => origin.startsWith(o)) ||
                localhostRegex.test(origin) ||
                lanIpRegex.test(origin) ||
                zeroHostRegex.test(origin)
            ) {
                callback(null, true);
            } else {
                callback(new Error("CORS policy does not allow access from this origin."), false);
            }
        },
        credentials: true,
    })
);

const io = new Server(server, {
  cors: {
    origin: [
      "https://admin-sidesa.vercel.app",
      "http://localhost:8081",
      "http://localhost:19006",
      "https://si-desa2.onrender.com", 
      "exp://",
      "exp+sistem-desa-mob://",
      "sistem-desa-mob://"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api", (req, res) => {
    res.send("Hello API");
});

app.use("/api", userRoutes);
app.use("/api", beritaRoutes);
app.use("/api", laporanRoutes);
app.use("/api", suratRoutes);
app.use("/api", dashboardRoutes);

io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.emit("notification", {
        title: "Welcome",
        body: "Real-time connection established.",
    });

    socket.on("client_event", (data) => {
        console.log("Received from client:", data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`API + Socket.IO running at http://0.0.0.0:${PORT}`);
});

module.exports = { app, server, io };
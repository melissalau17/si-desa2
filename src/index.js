const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Route imports
const userRoutes = require("./routes/userRoutes");
const keuanganRoutes = require("./routes/keuanganRoutes");
const beritaRoutes = require("./routes/beritaRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const suratRoutes = require("./routes/suratRoutes");

// Load environment variables
dotenv.config();

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://admin-sidesa.vercel.app", 
];

const localhostRegex = /^http:\/\/localhost(:\d+)?$/;
const lanIpRegex = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\d*(\.\d+)*(:\d+)?$/;

// CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        localhostRegex.test(origin) ||
        lanIpRegex.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow access from this origin."), false);
      }
    },
    credentials: true,
  })
);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        localhostRegex.test(origin) ||
        lanIpRegex.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS for Socket.IO"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Test route
app.get("/api", (req, res) => {
  res.send("hello API");
});

// API routes
app.use("/api", userRoutes);
app.use("/api", keuanganRoutes);
app.use("/api", beritaRoutes);
app.use("/api", laporanRoutes);
app.use("/api", suratRoutes);

// Socket.IO events
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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`API + Socket.IO running at http://0.0.0.0:${PORT}`);
});

module.exports = { app, server, io };

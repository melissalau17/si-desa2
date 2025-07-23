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

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Set this to your frontend origin if needed
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Test route
app.get("/api", (req, res) => {
  res.send("hello API");
});

// API routes
app.use("/api/", userRoutes);
app.use("/api/", keuanganRoutes);
app.use("/api/", beritaRoutes);
app.use("/api/", laporanRoutes);
app.use("/api/", suratRoutes);

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
server.listen(PORT, () => {
  console.log(`API + Socket.IO running at http://localhost:${PORT}`);
});

module.exports = { app, server, io };

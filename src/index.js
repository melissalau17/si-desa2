const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const serverless = require("serverless-http");

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
  "https://admin-sidesa.vercel.app", // production frontend
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // mobile apps, curl, postman
        allowedOrigins.includes(origin) || // exact whitelist
        /^http:\/\/localhost(:\d+)?$/.test(origin) // ✅ allow any localhost with any port
      ) {
        callback(null, true);
      } else {
        callback(
          new Error("CORS policy does not allow access from this origin."),
          false
        );
      }
    },
    credentials: true,
  })
);


const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin)
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
    },
    credentials: true
}));

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
server.listen(PORT, '0.0.0.0', () => {
    console.log(`API + Socket.IO running at http://0.0.0.0:${PORT}`);
});

module.exports = { app, server, io };
module.exports.handler = serverless(app);

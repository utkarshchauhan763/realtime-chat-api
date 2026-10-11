const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const socketAuth = require("./middleware/socketAuth");
const conversationRoutes = require("./routes/conversationRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Chat API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Chat API is healthy"
    });
});

io.use(socketAuth); // -> is Socket.IO middleware

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

connectDB();

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the process using it or set a different PORT in .env.`);
        process.exit(1);
    }

    console.error("Server failed to start:", error);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
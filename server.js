const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS to allow connections from any origin
app.use(cors({
    origin: "*", // This allows all origins, you can restrict to specific origins if needed
    methods: ["GET", "POST"],
}));

const io = new Server(server, {
    cors: {
        origin: "*", // Same here, allowing connections from all origins
        methods: ["GET", "POST"],
    },
});

let waitingUser = null;

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    if (waitingUser) {
        socket.partner = waitingUser;
        waitingUser.partner = socket;

        socket.emit("chat-started");
        waitingUser.emit("chat-started");

        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit("waiting");
    }

    socket.on("message", (msg) => {
        if (socket.partner) {
            socket.partner.emit("message", msg);
        }
    });

    socket.on("disconnect", () => {
        if (socket.partner) {
            socket.partner.emit("partner-disconnected");
            socket.partner.partner = null;
        }
        if (waitingUser === socket) {
            waitingUser = null;
        }
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));

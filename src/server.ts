import express from "express";
import cors from "cors";
import { config } from "dotenv";
import http from "http";
import { Server } from "socket.io";

config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("a user connected ", socket.id);

  socket.on("join-room", (room) => {
    // console.log(room);
    socket.join(room);
  });
  socket.on("selectingSong", (file, roomId) => {
    socket.to(roomId).emit("selectedSong", file);
  });

  socket.on("setPlayPause", (data, roomId) => {
    socket.to(roomId).emit("playPause", data);
  });

  socket.on("setProgress", (progress, roomId) => {
    socket.to(roomId).emit("progress", progress);
  });

  socket.on("disconnect", () => {
    // console.log("a user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

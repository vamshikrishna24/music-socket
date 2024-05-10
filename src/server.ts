import express from "express";
import cors from "cors";
import { config } from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import ytdl from "ytdl-core";

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

  socket.on("sendMessage", (data, roomId) => {
    data = { ...data, Id: uuid() };
    socket.to(roomId).emit("receiveMessage", data);
  });

  socket.on("loop", (loop, roomId) => {
    socket.to(roomId).emit("loop", loop);
  });

  socket.on("disconnect", () => {
    // console.log("a user disconnected", socket.id);
  });
});

app.get("/audio", async (req, res) => {
  try {
    const videoUrl: any = req.query.url;
    const audioStream = ytdl(videoUrl, { filter: "audioonly" });
    res.set({
      "Content-Type": "audio/mpeg",
    });
    audioStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

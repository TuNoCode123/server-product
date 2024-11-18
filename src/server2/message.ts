import express from "express";
const app = express();
import "dotenv/config";

const cors = require("cors");
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import Connect_To_Mongo, { client } from "../config/configMongo";
import { createServer } from "http";
import { Server } from "socket.io";
import { routerServer2 } from "./router";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../../../typeSocket";
const corsOpts = {
  origin: ["http://localhost:5174", "http://localhost:5173"],
  methods: ["GET", "POST", "OPTIONS", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};
app.use(cors(corsOpts));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
routerServer2(app);
Connect_To_Mongo()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ["http://localhost:5174", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let userOnline: {
  socketId?: string;
  userId?: number;
}[] = [];
io.on("connection", (socket) => {
  socket.on("online", (id) => {
    const isOnlined = userOnline.some((o) => o.userId == id);
    if (!isOnlined && id) {
      const tmp = {
        socketId: socket.id,
        userId: id,
      };
      userOnline.push(tmp);
    }

    io.emit("totalUserOnline", userOnline);
  });
  socket.on("disconnect", () => {
    userOnline = userOnline.filter((u) => u.socketId != socket.id);
    io.emit("totalUserOnline", userOnline);
  });
  socket.on("sentMess", (data) => {
    const isOnline = userOnline.find((u) => u.userId == data.receiverId);

    if (isOnline && isOnline.socketId) {
      io.to(isOnline.socketId).emit("receiverMess", data.mess);
      io.to(isOnline.socketId).emit("notification", {
        text: data.mess.text,
        senderId: data.mess.senderId,
        date: new Date(),
      });
    }
  });
  socket.on("updateMess", (data) => {
    const isOnline = userOnline.find((u) => u.userId == data.receiverId);
    if (isOnline && isOnline.socketId) {
      console.log("update", data);
      io.to(isOnline.socketId).emit("updateNewMess", data.mess);
    }
  });
  socket.on("deleteMess", (data) => {
    const isOnline = userOnline.find((u) => u.userId == data.receiverId);
    if (isOnline && isOnline.socketId) {
      io.to(isOnline.socketId).emit("deletePresentMess", data.mess);
    }
  });
});
const port = 5000;

httpServer.listen(port, () => {
  console.log(`The application is listening on port ${port}!`);
});

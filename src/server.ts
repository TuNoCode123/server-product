import express from "express";
const app = express();
import "dotenv/config";
import configRouter from "./routers";
import Database from "./config/configDb";
const cors = require("cors");
import cookieParser from "cookie-parser";
import { initRedis } from "./config/configRedis";

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
initRedis();
export const db = new Database();
db.sequelize?.sync();
configRouter(app);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The application is listening on port ${port}`);
});

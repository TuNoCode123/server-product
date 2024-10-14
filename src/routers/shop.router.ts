import { Router } from "express";

import { upload, uploadToCloudinary } from "../middleware/cloudinary";
import shopController from "../controllers/shop.controller";

const routerShop = Router();
routerShop.post(
  "/create-new-shop",
  upload.array("images", 2),
  uploadToCloudinary,
  shopController.createNewShop
);
routerShop.get("/find-shop", shopController.findShop);
export default routerShop;

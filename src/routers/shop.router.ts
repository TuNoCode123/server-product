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
routerShop.post("/create-coupon", shopController.createCounpon);
routerShop.get("/get-all-counpon", shopController.getAllCoupon);
routerShop.delete("/delete-coupon", shopController.deleteCoupon);
routerShop.put("/update-coupon", shopController.updateCoupon);

export default routerShop;

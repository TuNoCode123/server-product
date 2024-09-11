import { Router } from "express";
import userController from "../controllers/user.controller";
import { upload, uploadToCloudinary } from "../middleware/cloudinary";

const routerUser = Router();
routerUser.post(
  "/adduser",
  upload.array("images", 1),
  uploadToCloudinary,
  userController.addUser
);
routerUser.get("/get-all-users", userController.getAllUsers);
routerUser.get("/del-user-by-id", userController.deleteUserById);
routerUser.put(
  "/update-user",
  upload.array("images", 1),
  uploadToCloudinary,
  userController.updateUser
);
routerUser.get("/get-user-by-id", userController.getUserById);

export default routerUser;

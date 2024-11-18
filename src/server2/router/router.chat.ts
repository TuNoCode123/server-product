import { Router } from "express";
import controllerChat from "../../controllers/controller.chat";
import { upload, uploadToCloudinary } from "../../middleware/cloudinary";
const routerChat = Router();
routerChat.get("/get-chat-by-id", controllerChat.findChatById);
routerChat.post(
  "/create-mess",
  upload.array("images", 5),
  uploadToCloudinary,
  controllerChat.createMessage
);
routerChat.get("/get-all-mess", controllerChat.getAllMess);
// routerChat.get("/find-chat", controllerChat.findChat);
routerChat.get("/create-room", controllerChat.createRoom);
routerChat.put("/update-message", controllerChat.updateMessage);

export default routerChat;

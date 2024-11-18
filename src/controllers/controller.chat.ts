import { NextFunction, Request, Response } from "express";
import chatService from "../services/service.chat";
import serviceUser from "../services/service.user";
class ControllersChat {
  findChatById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(404).json({
          message: "missing input",
        });
      }
      const response = await chatService.getChatById(id);

      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  createMessage = async (req: Request, res: Response, next: NextFunction) => {
    const { roomId, senderId, text, cloudinaryUrls } = req.body;
    if (!roomId || !senderId) {
      return res.status(403).json({
        message: "missing input",
      });
    }
    try {
      const response = await chatService.createMess({
        roomId,
        senderId,
        text,
        cloudinaryUrls,
      });
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  getAllMess = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, partnerId } = req.query;
    if (!userId || !partnerId) {
      return res.status(403).json({
        message: "missing input",
      });
    }
    try {
      const response = await chatService.findAllMess(+userId, +partnerId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  findChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id1, id2 } = req.query;
      const response = await chatService.findChat(id1, id2);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, shopId } = req.query;
      if (!userId || !shopId) {
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      }

      const response = await chatService.createRoom(+userId, +shopId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  updateMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chatService.updateMess(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new ControllersChat();

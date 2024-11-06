import { NextFunction, Request, Response } from "express";
import serviceComment from "../services/service.comment";
import { Icomment, Iratinng } from "../interfaces/interface.user";

class CommentController {
  public createRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        userId,
        star,
        productId,
        productChildId,
        orderId,
        comment,
        cloudinaryUrls,
        publicIds,
        removeImageExisted,
      } = req.body;
      const comments: Iratinng = {
        comment,
        userId,
        star,
        productId,
        productChildId,
        orderId,
        removeImageExisted,
      };
      const response = await serviceComment.createRating({
        comment: comments,
        cloudinaryUrls,
        publicIds,
      });
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getAllComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productId } = req.query;
      if (!productId)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      const response = await serviceComment.getAllComment(+productId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public deleteRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT ID",
        });
      const response = await serviceComment.deleteRating(+id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getAllStarOfProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productId } = req.query;
      if (!productId)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT ID",
        });
      const response = await serviceComment.getAllStar(+productId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new CommentController();

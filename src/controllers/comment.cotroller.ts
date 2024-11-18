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
      const { productId, limit, page } = req.query;
      if (!productId || !page)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      const response = await serviceComment.getAllComment(
        +productId,
        +page,
        limit
      );
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      console.log(error);
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
  public likeComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ratingId, userId } = req.query;
      if (!ratingId || !userId)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT ID",
        });
      const response = await serviceComment.likeComment(+ratingId, +userId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getInforRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ratingId } = req.query;
      if (!ratingId)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT ID",
        });
      const response = await serviceComment.getInforRating(+ratingId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getAllCommentForShop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { shopId } = req.query;
      if (!shopId)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT ID",
        });
      const response = await serviceComment.getAllCommentForShop(+shopId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public replyComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceComment.replyComment(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getAllCommentOfShop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, commentId } = req.query;
      if (!userId || !commentId)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      const response = await serviceComment.getAllCommentOfShop(
        +userId,
        +commentId
      );
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public updateReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceComment.updateReply(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceComment.deleteRating(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public deleteReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceComment.deleteReply(req.query);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public statisticalFigueForShop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceComment.statisticalFigue(req.body);
      const { ST, ...restObject } = response;
      setTimeout(() => {
        return res.status(ST).json(restObject);
      }, 500);
      // return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public statisOther = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { shopId } = req.query;
      if (!shopId || shopId == "undefined") throw new Error("MISSING INPUT");
      const response = await serviceComment.statisOtherFigue(+shopId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new CommentController();

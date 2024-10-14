import { NextFunction, Request, Response } from "express";
import serviceShop from "../services/service.shop";

class ShopController {
  public createNewShop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceShop.createNewShop(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public findShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.query;
      if (!userId)
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      const response = await serviceShop.findShop(+userId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new ShopController();

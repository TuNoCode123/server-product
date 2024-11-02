import { NextFunction, Request, Response } from "express";
import serviceOrder from "../services/service.order";

class OrderController {
  public getAllOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(200).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      }
      const response = await serviceOrder.getAllOrder(+userId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getDetailOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(200).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      }
      const response = await serviceOrder.getDetailOrder(+orderId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public cancelOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(200).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      }
      const response = await serviceOrder.cancelOrder(+orderId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getAllOrderForShop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { shopId } = req.query;
      if (!shopId) {
        return res.status(200).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      }
      const response = await serviceOrder.getAllOrderForShop(+shopId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public transmissStateOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceOrder.stansmissState(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new OrderController();

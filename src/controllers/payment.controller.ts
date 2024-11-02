import { NextFunction, Request, Response } from "express";
import {
  capturePayment,
  checkStatusOrder,
  createOrder,
} from "../services/service.payment";
import orderService from "../services/service.order";
class PaymentController {
  public payment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { totalCart, listProduct } = req.body;
      if (!totalCart || !listProduct)
        return res.status(404).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      const url = await createOrder(totalCart, listProduct);
      const { ST, ...resObject } = url;
      return res.status(ST).json(resObject);
    } catch (error) {
      next(error);
    }
  };
  public completePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token, orderId, idPayment } = req.query;
      if (!token || !orderId || !idPayment) {
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      }
      const status = await checkStatusOrder(idPayment);

      if (status.EC == 0) {
        const isCapure = await capturePayment(token);
        if (isCapure.EC == 0) {
          const respone = await orderService.makeOrderSuccess(+orderId);
          const { ST, ...restObject } = respone;
          return res.status(ST).json(restObject);
        }
        return res.status(200).json({
          EC: 0,
          EM: "PAYMENT PROCESSING",
        });
      } else if (status.EC == 1) {
        const response = await orderService.makeOrderFailed(+orderId);
        const { ST, ...restObject } = response;
        return res.status(ST).json(restObject);
      }
      return res.status(500).json({
        EC: 1,
        EM: "NOT FETCH DATA PAYPAL",
      });
    } catch (error) {
      next(error);
    }
  };
  public cancelPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.query;
      if (!orderId)
        return res.status(200).json({
          EC: 1,
          EM: "MISSING INPUT",
        });
      const response = await orderService.makeOrderCancel(+orderId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new PaymentController();

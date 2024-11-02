import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import orderController from "../controllers/order.controller";

class Routers {
  public router: Router;
  constructor() {
    this.router = Router();
  }
}
const routerPayment = new Routers();
routerPayment.router.post("/payment-items", paymentController.payment);
routerPayment.router.get(
  "/completed-payment",
  paymentController.completePayment
);
routerPayment.router.get("/cancel-payment", paymentController.cancelPayment);

export default routerPayment.router;

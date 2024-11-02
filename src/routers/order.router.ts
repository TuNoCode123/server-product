import { Router } from "express";
import orderController from "../controllers/order.controller";
class Routers {
  public router: Router;
  constructor() {
    this.router = Router();
  }
}
const routerOrder = new Routers();
routerOrder.router.get("/get-all-order", orderController.getAllOrder);
routerOrder.router.get(
  "/get-all-order-for-shop",
  orderController.getAllOrderForShop
);
routerOrder.router.get("/get-detail-order", orderController.getDetailOrderById);
routerOrder.router.delete("/cancel-order", orderController.cancelOrder);
routerOrder.router.post(
  "/transmiss-state-order",
  orderController.transmissStateOrder
);

export default routerOrder.router;

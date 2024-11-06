import { Application } from "express";
import routerUser from "./user.router";
import { apiNotFound, finalErorr } from "../middleware/error";
import { verifyUser } from "../middleware/verifyUser";
import routerProduct from "./product.router";
import routerCategories from "./categoris.router";
import routerShop from "./shop.router";

import routerPayment from "./payment.router";
import routerOrder from "./order.router";
import routerComment from "./comment.router";

const configRouter = (app: Application) => {
  // app.use(verifyUser);
  app.use("/api/v1", routerUser);
  app.use("/api/v1", routerProduct);
  app.use("/api/v1", routerCategories);
  app.use("/api/v1", routerShop);
  app.use("/api/v1", routerOrder);
  app.use("/api/v1", routerPayment);
  app.use("/api/v1", routerComment);
  app.use(apiNotFound);
  app.use(finalErorr);
};
export default configRouter;

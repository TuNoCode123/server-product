import { Application } from "express";
import routerUser from "./user.router";
import { apiNotFound, finalErorr } from "../middleware/error";
import { verifyUser } from "../middleware/verifyUser";
import routerProduct from "./product.router";

const configRouter = (app: Application) => {
  // app.use(verifyUser);
  app.use("/api/v1", routerUser);
  app.use("/api/v1", routerProduct);
  app.use(apiNotFound);
  app.use(finalErorr);
};
export default configRouter;

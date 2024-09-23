import { Application } from "express";
import routerUser from "./user.router";
import { apiNotFound, finalErorr } from "../middleware/error";
import { verifyUser } from "../middleware/verifyUser";
import routerProduct from "./product.router";
import routerCategories from "./categoris.router";

const configRouter = (app: Application) => {
  // app.use(verifyUser);
  app.use("/api/v1", routerUser);
  app.use("/api/v1", routerProduct);
  app.use("/api/v1", routerCategories);

  app.use(apiNotFound);
  app.use(finalErorr);
};
export default configRouter;

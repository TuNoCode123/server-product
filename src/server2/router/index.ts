import { Application } from "express";
import { apiNotFound, finalErorr } from "../../middleware/error";
import routerChat from "./router.chat";

export const routerServer2 = (app: Application) => {
  app.use("/api/v1", routerChat);
  app.use(apiNotFound);
  app.use(finalErorr);
};

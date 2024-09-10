import { NextFunction, Request, Response } from "express";

import serviceMiddleware from "../services/service.middleware";
import { badRequest } from "../helpers/err";

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { refreshToken } = req.cookies;
    const refreshToken = req.headers["authorization"];
    const response = await serviceMiddleware.verifyUser(refreshToken);
    if (response.EC == 1) {
      return res.status(404).json(response);
    }
    return next();
  } catch (error) {
    console.log(error);
    return badRequest(error, res);
  }
};

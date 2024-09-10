import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ErrorType } from "../interfaces/interface.error";

export const apiNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return next(createHttpError(404, "not existed this api"));
};

export const finalErorr = (
  error: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(error.status || 500).json({
    EC: 1,
    EM: error.message,
  });
};

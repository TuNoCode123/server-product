import { Response } from "express";
import creatError from "http-errors";

export const badRequest = (err: any, res: Response) => {
  const error = creatError.BadRequest(err);
  return res.status(error.statusCode).json({
    EC: 1,
    EM: `${error.message}`,
  });
};
export const unAuthorized = (res: Response) => {
  const error = creatError.Unauthorized();
  return res.status(error.statusCode).json({
    EC: 1,
    EM: error.message,
  });
};
export const notFound = (err: any, res: Response) => {
  const error = creatError.NotFound(err);
  return res.status(error.statusCode).json({
    EC: 1,
    EM: error.message,
  });
};

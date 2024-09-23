import { NextFunction, Request, Response } from "express";

export const checkProductId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.body;
  console.log(req.body);
  if (!productId) {
    return res.status(404).json({
      EC: 1,
      EM: "missing input product id",
    });
  }
  try {
  } catch (error) {
    next(error);
  }
};

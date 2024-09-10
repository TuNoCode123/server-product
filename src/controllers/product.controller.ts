import { NextFunction, Request, Response } from "express";

import { Iproduct } from "../interfaces/interface.product";
import serviceProduct from "../services/service.product";
import createHttpError from "http-errors";

class ProductController {
  public addProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const products: Iproduct[] = req.body;
      const newProducts = products.map((item, index) => {
        return {
          ...item,
          totalPrices: item.price * item.discount,
        };
      });
      const response = await serviceProduct.addProduct(newProducts);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(createHttpError(400, "error at addProduct"));
    }
  };
  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      const response = await serviceProduct.getProductByid(id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(createHttpError(400, "error at getProductById"));
    }
  };
  public deleteProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.query;
    try {
      const response = await serviceProduct.deleteProductById(id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(createHttpError(400, "error at deleteProdudctById"));
    }
  };
  public updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.updateProduct(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(createHttpError(400, "error at updateProduct"));
    }
  };
  // attribute product
  public addAtrributeIntoProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, attribute } = req.body;
      if (!id || attribute.length == 0) {
        return res.status(404).json({
          EC: 1,
          EM: "not found at addAtrributeIntoProduct",
        });
      }

      const response = await serviceProduct.addAtrributeIntoProduct(
        +id,
        attribute
      );
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(createHttpError(400, "error at updateProduct"));
    }
  };
}
export default new ProductController();

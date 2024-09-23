import { NextFunction, Request, Response } from "express";

import { Iproduct } from "../interfaces/interface.product";
import serviceProduct from "../services/service.product";
import createHttpError from "http-errors";
import { IimageProduct } from "../interfaces/interface.user";

class ProductController {
  public addProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const products: Iproduct[] = req.body.data;

      const newProducts = products.map((item, index) => {
        if (item.discount) {
          return {
            ...item,
            totalPrices: item.price * item.discount,
          };
        }
        delete item.uuid;
        return {
          ...item,
        };
      });
      console.log("new", newProducts);
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
      const { attribute } = req.body;

      const response = await serviceProduct.addAtrributeIntoProduct(attribute);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(createHttpError(400, "error at updateProduct"));
    }
  };

  public getAllProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.getAllProduct(req.query);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public addImagesIntoProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cloudinaryUrls, publicIds, productId } = req.body;
      const newData: IimageProduct[] = [];

      for (let i = 0; i < cloudinaryUrls.length; i++) {
        const temp: IimageProduct = {
          productId: productId,
          image: cloudinaryUrls[i],
          publicId: publicIds[i],
        };
        newData.push(temp);
      }
      if (newData && newData.length <= 0) {
        return res.status(400).json({
          EC: 1,
          EM: "not found find image",
        });
      }
      const response = await serviceProduct.addImageIntoProduct(newData);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public addDescriptionIntoProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.addDescriptionIntoProduct(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getAttributeOfProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      }
      const response = await serviceProduct.getAttributeOfProduct(+id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public deleteAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, productId } = req.query;
      if (!id || !productId) {
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      }
      const response = await serviceProduct.deleteAttribute(+id, +productId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public updateAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { att } = req.body;
      if (!att) {
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      }
      const response = await serviceProduct.updateAttribute(att);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getImageOfProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      }
      const response = await serviceProduct.getImageOfProduct(+id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public deleteImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, productId } = req.query;
      if (!id || !productId) {
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      }
      const response = await serviceProduct.deleteImage(+id, +productId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new ProductController();

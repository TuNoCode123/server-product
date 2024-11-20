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
      const shopId = req.body.shopId;
      if (!shopId || !products)
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });
      const qty: number[] = [];
      const newProducts = products.map((item, index) => {
        delete item.uuid;
        if (item.quantity) {
          qty.push(item.quantity);
        }

        delete item.quantity;
        if (item.discount) {
          return {
            ...item,
            totalPrices: item.price * item.discount,
          };
        }
        return {
          ...item,
        };
      });
      const response = await serviceProduct.addProduct(
        newProducts,
        shopId,
        qty
      );
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

  public addChildProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.addChildProduct(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getAllChildProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(404).json({
          EC: 1,
          EM: "missing input",
        });

      const response = await serviceProduct.getAllChildProduct(+id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public deleteChildProduct = async (
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
      const response = await serviceProduct.deleteChildProduct(+id, +productId);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public listingProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.listingProduct(req.query);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getSimilarProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.getSimilarProduct(req.query);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public checkQuantity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceProduct.checkQuantity(req.query);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getListProductSalest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { limit } = req.query;
      if (!process.env.LIMIT_SALE_PRODUCT) throw new Error("ENV NOT READY");
      const result = limit ?? process.env.LIMIT_SALE_PRODUCT;
      const response = await serviceProduct.getProductsSalest(+result);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public getListProductNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { limit, page } = req.query;
      if (!page) throw new Error("MISSING INPUT");
      if (!process.env.LIMIT_SALE_PRODUCT) throw new Error("ENV NOT READY");
      const result = limit ?? process.env.LIMIT_SALE_PRODUCT;
      const response = await serviceProduct.getProductsNote(+result, +page);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };

  public searchItems = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { limit, page, search, price, date } = req.query;
      if (!page || !search) throw new Error("MISSING INPUT");
      if (!process.env.LIMIT_SALE_PRODUCT) throw new Error("ENV NOT READY");
      const result = limit ?? process.env.LIMIT_SALE_PRODUCT;
      const response = await serviceProduct.searchItems(
        +result,
        +page,
        search,
        price,
        date
      );
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new ProductController();

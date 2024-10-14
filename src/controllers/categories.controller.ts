import { NextFunction, Request, Response } from "express";
import serviceCategories from "../services/service.categories";

class CategoriesController {
  public creatCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceCategories.creatCategory(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getAllCateGory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceCategories.getAllCateGory(req.query);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public deleteCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      const response = await serviceCategories.deleteCategoryById(id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceCategories.updateCategory(req.body);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getAllcategoryNoPaginate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceCategories.getAllcategoryNoPaginate(
        req.query
      );
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getCategoryById = async (
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
      const response = await serviceCategories.getAllcategoryById(+id);
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
  public getAllcategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await serviceCategories.getAllCategories();
      const { ST, ...restObject } = response;
      return res.status(ST).json(restObject);
    } catch (error) {
      next(error);
    }
  };
}
export default new CategoriesController();

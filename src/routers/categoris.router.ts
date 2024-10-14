import { Router } from "express";
import categoriesController from "../controllers/categories.controller";
import { upload, uploadToCloudinary } from "../middleware/cloudinary";

const routerCategories = Router();
routerCategories.post(
  "/create-category",
  upload.array("images", 1),
  uploadToCloudinary,
  categoriesController.creatCategories
);
routerCategories.get("/get-all-category", categoriesController.getAllCateGory);
routerCategories.get(
  "/get-all-category-no-paginate",
  categoriesController.getAllcategoryNoPaginate
);
routerCategories.delete(
  "/delete-category",
  categoriesController.deleteCategoryById
);
routerCategories.put(
  "/update-category",
  upload.array("images", 1),
  uploadToCloudinary,
  categoriesController.updateCategory
);
routerCategories.get(
  "/get-all-category-by-id",
  categoriesController.getCategoryById
);
routerCategories.get(
  "/get-all-categories",
  categoriesController.getAllcategories
);

export default routerCategories;

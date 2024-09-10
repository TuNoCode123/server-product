import { Router } from "express";
import productController from "../controllers/product.controller";

const routerProduct = Router();
routerProduct.post("/add-product", productController.addProduct);
routerProduct.get("/get-product-by-id", productController.getProductById);
routerProduct.delete(
  "/delete-product-by-id",
  productController.deleteProductById
);
routerProduct.put("/update-product", productController.updateProduct);
routerProduct.post(
  "/add-attri-into-pro",
  productController.addAtrributeIntoProduct
);

export default routerProduct;

import { Router } from "express";
import productController from "../controllers/product.controller";
import { upload, uploadToCloudinary } from "../middleware/cloudinary";

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
routerProduct.get("/get-all-product", productController.getAllProduct);
routerProduct.post(
  "/add-images-into-product",
  upload.array("images", 10),
  uploadToCloudinary,
  productController.addImagesIntoProduct
);
routerProduct.post(
  "/add-description-into-product",
  productController.addDescriptionIntoProduct
);
routerProduct.get(
  "/get-attributes-of-product",
  productController.getAttributeOfProduct
);

routerProduct.delete("/delete-attribute", productController.deleteAttribute);
routerProduct.put("/update-attribute", productController.updateAttribute);

routerProduct.get("/get-image-of-product", productController.getImageOfProduct);

routerProduct.delete("/delete-image", productController.deleteImage);

export default routerProduct;

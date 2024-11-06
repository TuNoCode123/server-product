import { Op } from "sequelize";
import {
  IattributeProduct,
  IchildProduct,
  IchildProductCreationAttributes,
  IdescriptionProduct,
  Iproduct,
} from "../interfaces/interface.product";
import { IimageProduct } from "../interfaces/interface.user";
import Attri_Product from "../models/model.attribute_pro";
import Category from "../models/model.category";
import Image_Product from "../models/model.image_product";
import infor_Product from "../models/model.inforpro";
import Products from "../models/model.product";
import Product_Description from "../models/model.productDescription";
import { db } from "../server";
import { deteteImageFromClound } from "../utils/deleteImage";
import { deleteValue, getValue, redisLabel, setValue } from "../utils/redis";
import Shop from "../models/model.Shop";
import Seller from "../models/model.inforSeller";
import Inventory from "../models/model.inventory";
import Rating from "../models/model.rating";

class ServiceProduct {
  public addProduct = async (product: any[], shopId: number, qty: number[]) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    const t1 = await sequelize.transaction();
    try {
      if (!Array.isArray(product) || product.length === 0) {
        return {
          ST: 404,
          EC: 1,
          EM: "Invalid input: product list is empty or not an array",
          data: "",
        };
      }
      const res = await Products.bulkCreate(product, {
        transaction: t,
      });
      const plainObjects = res.map((product) => product.toJSON());

      const customShop = [];
      const customInventory = [];
      for (let i = 0; i < plainObjects.length; i++) {
        const temp = {
          shopId: shopId,
          productId: plainObjects[i].id,
        };
        const temp1 = {
          productId: plainObjects[i].id,
          quantity: qty[i],
        };
        customInventory.push(temp1);
        customShop.push(temp);
      }
      t.commit();
      await Inventory.bulkCreate(customInventory);
      await Seller.bulkCreate(customShop, {
        transaction: t1,
      });
      t1.commit();
      return {
        ST: res && res.length > 0 ? 200 : 400,
        EC: 0,
        EM: "OK",
      };
    } catch (error) {
      t.rollback();
      t1.rollback();
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
          data: "",
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
        data: "",
      };
    }
  };
  public getProductByid = async (id: any) => {
    try {
      if (!id) {
        return {
          ST: 404,
          EC: 1,
          EM: "missing id in get product",
        };
      }

      const memThisProduct = await getValue(id);
      if (memThisProduct && memThisProduct.EC == 1) {
        const res = await Products.findByPk(id, {
          include: [
            {
              model: Product_Description,
              as: "pro_des",
            },
            {
              model: Attri_Product,
              as: "at_product",
            },
            {
              model: Image_Product,
              as: "img_product",
            },
            {
              model: infor_Product,
              as: "infor_product",
            },
            {
              model: Shop,
            },
            {
              model: Inventory,
              as: "product_inventory",
            },
          ],
        });
        const setRedisProduct = await setValue(id, JSON.stringify(res));
        if (setRedisProduct && setRedisProduct.EC == 1) {
          throw Error(setRedisProduct.EM);
        }
        return {
          ST: res ? 200 : 404,
          EC: res ? 0 : 1,
          EM: res ? "OK" : "product not existed",
          data: res,
        };
      }
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data:
          memThisProduct &&
          memThisProduct.data &&
          JSON.parse(memThisProduct.data),
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EM: "ERROR at get product",
      };
    }
  };
  public deleteProductById = async (id: any) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    if (!id) {
      return {
        ST: 404,
        EC: 1,
        EM: "missing id in get product",
      };
    }

    try {
      const res = await Products.destroy({
        where: {
          id,
        },
        transaction: t,
      });

      if (res && res > 0) {
        const isExistedProduct = await getValue(id);
        if (isExistedProduct && isExistedProduct.EC == 0) {
          const isDelete = await deleteValue(id);
          if (isDelete && (isDelete.EC == 99 || isDelete.EC == 1)) {
            throw Error(isDelete.EM);
          }
        } else if (isExistedProduct && isExistedProduct.EC == 99) {
          throw Error(isExistedProduct.EM);
        }
      }
      t.commit();
      return {
        ST: res > 0 ? 200 : 400,
        EC: 0,
        EM: `deleted product id = ${id}`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public updateProduct = async (product: Iproduct) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const { id, quantity, ...restObject } = product;
      if (!id) {
        return {
          ST: 404,
          EC: 1,
          EM: "missing id in update Product",
        };
      }
      const isExistedProductInPostgres = await Products.findByPk(id);
      if (!isExistedProductInPostgres) {
        return {
          ST: 404,
          EC: 0,
          EM: `product having id = ${id} is not existed`,
        };
      }
      if (quantity) {
        await Inventory.create(
          {
            productId: id,
            // productChildId: id,
            quantity,
          },
          {
            transaction: t,
          }
        );
      }
      const [affectRows, updatedProduct] = await Products.update(
        {
          ...restObject,
          totalPrices: restObject.totalPrices
            ? restObject.totalPrices
            : isExistedProductInPostgres.totalPrices,
        },
        {
          where: {
            id,
          },
          transaction: t,
          returning: true,
        }
      );
      if (affectRows && affectRows > 0) {
        const newProductInRedis = await setValue(
          id,
          JSON.stringify(updatedProduct[0])
        );
        if (newProductInRedis && newProductInRedis.EC == 99) {
          throw Error("error redis at updateProduct ");
        }
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `update product id = ${id}`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public addAtrributeIntoProduct = async (attribute: any) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const isExistedProduct = await Products.findByPk(attribute[0]?.productId);
      if (!isExistedProduct) {
        return {
          ST: 404,
          EC: 1,
          EM: "PRODUCT NOT EXISTED",
        };
      }
      await deleteValue(attribute[0].productId.toString());
      await Attri_Product.bulkCreate(attribute, {
        transaction: t,
      });
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public getAllProduct = async (pagination: any) => {
    try {
      const { page, limitPage, shopId } = pagination;
      const limitEnv = process.env.limit;
      const newLimit = limitPage == "undefined" ? limitEnv : limitPage;
      const newPage = page == "undefined" ? 0 : page;
      const currentPage = +newPage * +newLimit;
      const rows = await Products.findAll({
        include: [
          {
            model: Shop,
            where: {
              id: shopId,
            },
          },
        ],
        limit: +newLimit,
        offset: +currentPage,
        nest: true,
        raw: true,
      });
      const condition = rows && rows.length > 0;
      return {
        ST: condition ? 200 : 400,
        EC: condition ? 0 : 1,
        EM: condition ? "OK" : "Not Product",
        data: {
          rows,
          count: rows.length,
        },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public addImageIntoProduct = async (images: any) => {
    try {
      const res = await Image_Product.bulkCreate(images);
      const condition = res && res.length > 0;

      if (condition) {
        await deleteValue(`I${images[0].productId}`);
      }
      return {
        ST: condition ? 200 : 400,
        EC: condition ? 0 : 1,
        EM: condition ? "OK" : "No Image",
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public addDescriptionIntoProduct = async (
    description: IdescriptionProduct
  ) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const { productId, ...resObject } = description;
      if (!productId) {
        return {
          ST: 404,
          EC: 1,
          EM: "missing productId",
        };
      }

      const isExistedProduct = await Products.findByPk(productId);
      if (!isExistedProduct) {
        return {
          ST: 404,
          EC: 1,
          EM: " productId isn't existed",
        };
      }
      const isExistedDescription = await Product_Description.findOne({
        where: {
          productId,
        },
      });
      if (isExistedDescription) {
        await Product_Description.update(resObject, {
          where: {
            productId,
          },
          transaction: t,
        });
      } else {
        await Product_Description.create(
          {
            ...description,
          },
          {
            transaction: t,
          }
        );
      }
      await deleteValue(productId.toString());
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: isExistedDescription
          ? `update description for id=${productId}  success`
          : `create description for id=${productId}  success`,
      };
    } catch (error) {
      console.log(error);
      t.rollback();
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public getAttributeOfProduct = async (productId: number) => {
    try {
      const isExistedMemAttribute = await getValue(`a${productId}`);
      let res: Attri_Product[] = [];
      if (isExistedMemAttribute && isExistedMemAttribute.EC == 1) {
        res = await Attri_Product.findAll({
          where: {
            productId,
          },
        });
        if (res && res.length > 0) {
          await setValue(`a${productId}`, JSON.stringify(res));
        }
      }

      return {
        ST:
          (isExistedMemAttribute.EC == 0 && res.length == 0) ||
          (isExistedMemAttribute.EC == 1 && res.length > 0)
            ? 200
            : 400,
        EC: res.length > 0 || isExistedMemAttribute.EC == 0 ? 0 : 1,
        EM:
          res.length > 0 || isExistedMemAttribute.EC == 0
            ? "OK"
            : "Not Attribute",
        data:
          res.length > 0
            ? {
                res,
                count: res.length,
              }
            : {
                res: isExistedMemAttribute.data
                  ? JSON.parse(isExistedMemAttribute.data)
                  : "",
                count: isExistedMemAttribute.data?.length,
              },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public deleteAttribute = async (id: number, productId: number) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const res = await Attri_Product.destroy({
        where: {
          id,
        },
        transaction: t,
      });
      if (res && res > 0) {
        await deleteValue(`a${productId}`);
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `Delete attribute id=${id} of product id=${productId} success`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public updateAttribute = async (attribute: IattributeProduct) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const { productId, id, ...resObject } = attribute;
      const [rowAffected] = await Attri_Product.update(
        {
          ...resObject,
        },
        {
          where: {
            id,
          },
          transaction: t,
        }
      );
      if (rowAffected && rowAffected > 0) {
        await deleteValue(`a${productId}`);
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `update attribute id=${id} of product id=${productId} success`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public getImageOfProduct = async (productId: number) => {
    try {
      const isExistedMemAttribute = await getValue(`I${productId}`);
      let res: Image_Product[] = [];
      if (isExistedMemAttribute && isExistedMemAttribute.EC == 1) {
        res = await Image_Product.findAll({
          where: {
            productId,
          },
        });
        if (res && res.length > 0) {
          await setValue(`I${productId}`, JSON.stringify(res));
        }
      }

      return {
        ST: 200,
        EC: 0,
        EM:
          res.length > 0 || isExistedMemAttribute.EC == 0 ? "OK" : "Not Image",
        data:
          res.length > 0
            ? {
                res,
                count: res.length,
              }
            : {
                res:
                  isExistedMemAttribute &&
                  isExistedMemAttribute.EC == 0 &&
                  isExistedMemAttribute.data
                    ? JSON.parse(isExistedMemAttribute.data)
                    : undefined,
                count: isExistedMemAttribute.data?.length,
              },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };

  public deleteImage = async (id: number, productId: number) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const isExstedProduct = await Products.findByPk(productId);
      if (!isExstedProduct) {
        return {
          ST: 404,
          EC: 1,
          EM: `Product isn't existed`,
          data: [],
        };
      }
      const isExistedImage = await Image_Product.findByPk(id, {
        raw: true,
        nest: true,
      });
      if (!isExistedImage) {
        return {
          ST: 404,
          EC: 1,
          EM: `Image isn't existed`,
          data: [],
        };
      }
      const res = await Image_Product.destroy({
        where: {
          id,
        },
        transaction: t,
      });
      if (res && res > 0) {
        await Promise.all([
          deleteValue(`I${productId}`),
          deteteImageFromClound(isExistedImage.publicId),
        ]);
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `Delete image id=${id} of product id=${productId} success`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };

  public addChildProduct = async (
    product: IchildProductCreationAttributes[]
  ) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      if (product.length == 0) {
        return {
          ST: 404,
          EC: 1,
          EM: "missing input",
        };
      }
      const productId = product[0].productId;
      const isExistedProduct = await Products.findByPk(productId, {
        transaction: t,
      });
      if (!isExistedProduct)
        return {
          ST: 404,
          EC: 1,
          EM: "Product Id isn't  existed",
        };
      const listQuantity: {
        productId: any;
        quantity: number | undefined;
        productChildId: any;
      }[] = [];
      const newListProduct = product.map((item, index) => {
        listQuantity.push({
          productChildId: "none",
          productId: item.productId,
          quantity: item.quantity,
        });
        delete item.quantity;
        return {
          ...item,
        };
      });
      const listChild = await infor_Product.bulkCreate(newListProduct, {
        transaction: t,
      });
      const listChildObject = listChild.map((child) => child.toJSON());
      const newlistInventory = listQuantity.map((item, index) => {
        return {
          ...item,
          productChildId: listChildObject[index]?.id,
        };
      });
      await Inventory.bulkCreate(newlistInventory, {
        transaction: t,
      });
      await deleteValue(`C${productId}`);
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `Add ${product.length} Product Child successfully`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };

  public getAllChildProduct = async (productId: number) => {
    try {
      const isMemChildProduct = await getValue(`C${productId}`);
      let res: infor_Product[] = [];
      if (isMemChildProduct && isMemChildProduct.EC == 1) {
        res = await infor_Product.findAll({
          include: [
            {
              model: Inventory,
              as: "product_child_inventory",
            },
          ],
          where: {
            productId,
          },
        });
        if (res && res.length > 0) {
          await setValue(`C${productId}`, JSON.stringify(res));
        }
      }
      return {
        ST: 200,
        EC: 0,
        EM: "ok",
        data:
          res.length > 0
            ? res
            : isMemChildProduct && isMemChildProduct.data
            ? JSON.parse(isMemChildProduct.data)
            : [],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };

  public deleteChildProduct = async (id: number, productId: number) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    const t = await sequelize.transaction();
    try {
      const isExistedProduct = await Products.findByPk(productId);
      if (!isExistedProduct)
        return {
          ST: 404,
          EC: 1,
          EM: `Product isn't existed`,
        };
      const res = await infor_Product.destroy({
        where: {
          id,
        },
        transaction: t,
      });
      if (res && res > 0) {
        await deleteValue(`C${productId}`);
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `Delete childProduct id=${id} successfully`,
      };
    } catch (error) {
      t.rollback();
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };

  public listingProduct = async (tt: any) => {
    try {
      const { limit, page, categoryId } = tt;
      const limitEnv = process.env.limit;
      const newLimit = limit == "undefined" ? limitEnv : limit;
      const newPage = page == "undefined" ? 0 : page;
      const currentPage = +newPage * +newLimit;
      const pageMem = await getValue(`PAGE${categoryId}`);
      const listProductMem = await getValue(`CATE${categoryId}`);
      if (pageMem && pageMem.EC == 0 && pageMem.data == newPage)
        if (listProductMem && listProductMem.data) {
          return {
            ST: 200,
            EC: 0,
            EM: "OK",
            data: JSON.parse(listProductMem.data),
          };
        }
      const getAllIdOfChildCate = await Category.findAll({
        where: {
          parentId: +categoryId,
        },
        attributes: ["id"],
      });
      const arrayId = getAllIdOfChildCate.map((item) => item.id);
      const getAllProduct = await Products.findAll({
        where: {
          categoryId: { [Op.in]: arrayId },
        },
        include: [
          {
            model: Image_Product,
            as: "img_product",
          },
          {
            model: Category,
            as: "pro_cate",
          },
        ],

        limit: +newLimit,
        offset: currentPage,
      });
      if (getAllProduct && getAllProduct.length > 0) {
        await setValue(`CATE${categoryId}`, JSON.stringify(getAllProduct));
        await setValue(`PAGE${categoryId}`, `${page}`);
      }
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: getAllProduct,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public getSimilarProduct = async (listId: any) => {
    try {
      const { categoryId, productId, limit } = listId;

      if (!categoryId || !productId) {
        return {
          ST: 404,
          EM: "MISSING INPUT",
          EC: 1,
        };
      }

      const isExistedCategory = await Category.findByPk(categoryId, {
        nest: true,
        raw: true,
      });
      if (!isExistedCategory)
        return {
          ST: 404,
          EC: 1,
          EM: "category not existed",
        };
      if (!process.env.LIMIT_PRODUCT_SIMILAR)
        return {
          ST: 500,
          EM: "ENV NOT READY",
          EC: 1,
        };
      const newLimit =
        limit != "undefined" ? +limit : +process.env.LIMIT_PRODUCT_SIMILAR;
      const productSimilar = await Products.findAll({
        where: {
          categoryId,
          id: { [Op.notIn]: [productId] },
        },
        limit: newLimit,
      });
      return {
        ST: 200,
        EM: "OK",
        EC: 0,
        data: productSimilar,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
  public checkQuantity = async (query: any) => {
    try {
      const { productId, productChildId, quantity } = query;

      let res: any;
      if (productChildId != "undefined") {
        res = await Inventory.findOne({
          where: {
            productId,
            productChildId,
          },
          nest: true,
          raw: true,
        });
        if (!res) {
          return {
            ST: 404,
            EC: 1,
            EM: `product isn't quantity`,
          };
        }
      } else {
        console.log(2);
        res = await Inventory.findOne({
          where: {
            productId: +productId,
          },
          nest: true,
          raw: true,
        });
        if (!res) {
          return {
            ST: 404,
            EC: 1,
            EM: `product isn't quantity`,
          };
        }
      }
      if (res.quantity >= quantity) {
        return {
          ST: 200,
          EC: 0,
          EM: "OK",
        };
      } else {
        return {
          ST: 400,
          EC: 1,
          EM: "eccess quantity",
        };
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EC: 1,
        EM: "ERROR at delete Product ById",
      };
    }
  };
}
export default new ServiceProduct();

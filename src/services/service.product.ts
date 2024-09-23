import {
  IattributeProduct,
  IdescriptionProduct,
  Iproduct,
} from "../interfaces/interface.product";
import { IimageProduct } from "../interfaces/interface.user";
import Attri_Product from "../models/model.attribute_pro";
import Image_Product from "../models/model.image_product";
import Products from "../models/model.product";
import Product_Description from "../models/model.productDescription";
import { db } from "../server";
import { deteteImageFromClound } from "../utils/deleteImage";
import { deleteValue, getValue, redisLabel, setValue } from "../utils/redis";

class ServiceProduct {
  public addProduct = async (product: any[]) => {
    try {
      if (!Array.isArray(product) || product.length === 0) {
        return {
          ST: 404,
          EC: 1,
          EM: "Invalid input: product list is empty or not an array",
          data: "",
        };
      }
      const res = await Products.bulkCreate(product);
      return {
        ST: res && res.length > 0 ? 200 : 400,
        EC: 0,
        EM: "OK",
      };
    } catch (error) {
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
      const { id, ...restObject } = product;
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
      const [affectRows, updatedProduct] = await Products.update(
        {
          ...restObject,
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
      const { page, limitPage } = pagination;
      const limitEnv = process.env.limit;
      const newLimit = limitPage == "undefined" ? limitEnv : limitPage;
      const newPage = page == "undefined" ? 0 : page;
      const currentPage = +newPage * +newLimit;
      const rows = await Products.findAll({
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
}
export default new ServiceProduct();

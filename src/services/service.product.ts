import { IattributeProduct, Iproduct } from "../interfaces/interface.product";
import Attri_Product from "../models/model.attribute_pro";
import Products from "../models/model.product";
import { db } from "../server";
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
        const res = await Products.findByPk(id);
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
        ST: 200,
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
  public addAtrributeIntoProduct = async (
    productId: number,
    attribute: any
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
      const isExistedProduct = await Products.findByPk(productId);
      if (!isExistedProduct) {
        return {
          ST: 404,
          EC: 1,
          EM: "PRODUCT NOT EXISTED",
        };
      }
      const addIdIntoPerAttri = attribute.map((item: any) => {
        return {
          productId,
          ...item,
        };
      });
      await Attri_Product.bulkCreate(addIdIntoPerAttri, {
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
}
export default new ServiceProduct();

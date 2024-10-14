import { Op } from "sequelize";
import { Icategory } from "../interfaces/interface.user";
import Category from "../models/model.category";
import Products from "../models/model.product";
import { db } from "../server";
import { deteteImageFromClound } from "../utils/deleteImage";
import Shop from "../models/model.Shop";

class ServiceCategories {
  public creatCategory = async (category: any) => {
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
      const { nameVi, cloudinaryUrls, id_cloundinary, ...restObject } =
        category;
      if (!nameVi)
        return {
          ST: 404,
          EC: 1,
          EM: "missing input",
        };
      if (cloudinaryUrls && id_cloundinary) {
        const [result, created] = await Category.findOrCreate({
          where: { nameVi },
          defaults: {
            ...restObject,
            image: cloudinaryUrls[0],
            publicId: id_cloundinary,
            nameVi,
          },
        });
        if (!created) {
          return {
            ST: 400,
            EC: 1,
            EM: `category that have name ${nameVi} existed`,
          };
        }
        return {
          ST: 200,
          EC: 0,
          EM: "add category successfully",
        };
      }
      const [result, created] = await Category.findOrCreate({
        where: { nameVi },
        defaults: {
          ...restObject,
          nameVi,
        },
      });
      t.commit();
      if (!created) {
        return {
          ST: 400,
          EC: 1,
          EM: `category that have name ${nameVi} existed`,
        };
      }
      return {
        ST: 200,
        EC: 0,
        EM: "add category successfully",
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
        EM: "ERROR at creatCategory",
      };
    }
  };
  public getAllCateGory = async (pagination: any) => {
    try {
      const { page, limitPage } = pagination;
      const limitEnv = process.env.limit;
      const newLimit = limitPage == "undefined" ? limitEnv : limitPage;
      const newPage = page == "undefined" ? 0 : page;
      const currentPage = +newPage * +newLimit;
      const { rows, count } = await Category.findAndCountAll({
        limit: +newLimit,
        offset: +currentPage,
        nest: true,
        raw: true,
      });
      const condition = rows && rows.length > 0;
      return {
        ST: condition ? 200 : 400,
        EC: condition ? 0 : 1,
        EM: condition ? "OK" : "Not Category",
        data: {
          rows,
          count,
        },
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
        EM: "ERROR at creatCategory",
      };
    }
  };
  public deleteCategoryById = async (id: any) => {
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
      if (!id) {
        return {
          ST: 404,
          EC: 1,
          EM: "missing input",
        };
      }
      const isExistedCategory = await Category.findByPk(id);
      if (!isExistedCategory)
        return {
          ST: 404,
          EC: 1,
          EM: "id not existed",
        };
      const res = await Category.destroy({
        where: { id },
      });
      if (res > 0) {
        await deteteImageFromClound(isExistedCategory.publicId);
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `deleted id=${id}`,
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
        EM: "ERROR at creatCategory",
      };
    }
  };
  public updateCategory = async (newCate: any) => {
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
      const { cloudinaryUrls, id_cloundinary, id, publicId, ...restObject } =
        newCate;
      console.log("public id", publicId);
      if (cloudinaryUrls || id_cloundinary) {
        const [result] = await Category.update(
          {
            ...restObject,
            publicId: id_cloundinary,
            image: cloudinaryUrls[0],
          },
          {
            where: {
              id,
            },
            transaction: t,
          }
        );
        if (result > 0 && publicId) {
          await deteteImageFromClound(publicId.split("/")[1]);
        }
        t.commit();
        return {
          ST: 200,
          EC: 0,
          EM: `update id=${id} successfully`,
        };
      }
      await Category.update(
        {
          ...restObject,
        },
        {
          where: { id },
          transaction: t,
        }
      );
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: `update id=${id} successfully`,
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
        EM: "ERROR at creatCategory",
      };
    }
  };
  public getAllcategoryNoPaginate = async (query: any) => {
    try {
      const { shopId } = query;
      if (!shopId) {
        return {
          ST: 400,
          EC: 1,
          EM: "missing input",
        };
      }
      const res = await Category.findAll({
        include: {
          model: Products,
          as: "cate_pro",
          include: [
            {
              model: Shop,
              where: {
                id: shopId,
              },
            },
          ],
        },
        order: [["id", "ASC"]],
      });
      const condition = res && res.length > 0;
      return {
        ST: condition ? 200 : 400,
        EC: condition ? 0 : 1,
        EM: condition ? "OK" : "Failed",
        data: res,
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
        EM: "ERROR at creatCategory",
      };
    }
  };
  public getAllcategoryById = async (parentId: number) => {
    try {
      const res = await Category.findAll({
        where: {
          parentId,
        },
      });
      const condition = res && res.length > 0;
      return {
        ST: 200,
        EC: condition ? 0 : 1,
        EM: condition ? "OK" : "Failed",
        data: res,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          ST: 400,
          EM: error.message,
        };
      }
      return {
        ST: 400,
        EM: "ERROR at creatCategory",
      };
    }
  };

  public getAllCategories = async () => {
    try {
      const res = await Category.findAll({
        where: {
          parentId: { [Op.eq]: null },
        },
        order: [["id", "ASC"]],
      });
      const condition = res && res.length > 0;
      return {
        ST: condition ? 200 : 400,
        EC: condition ? 0 : 1,
        EM: condition ? "OK" : "Failed",
        data: res,
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
        EM: "ERROR at creatCategory",
      };
    }
  };
}
export default new ServiceCategories();

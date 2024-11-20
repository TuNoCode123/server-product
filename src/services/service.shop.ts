import instance from "../helpers/axios";
import { Ishop } from "../interfaces/interface.product";
import { Icounpon } from "../interfaces/interface.user";
import Coupon from "../models/model.coupon";
import Shop from "../models/model.Shop";
import { db } from "../server";
import { setValueWithTime } from "../utils/redis";

class ServiceShop {
  public createNewShop = async (shop: any) => {
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
      const { userId, cloudinaryUrls, publicIds } = shop;
      if (!userId)
        return {
          ST: 404,
          EC: 1,
          EM: "userID not found",
        };

      await Shop.create({
        ...shop,
        image: cloudinaryUrls[0],
        logo: cloudinaryUrls[1],
        idLogo: publicIds[1],
        idBacklog: publicIds[0],
      });
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
      };
    } catch (error) {
      t.rollback();
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
  public findShop = async (userId: number) => {
    try {
      const res = await Shop.findOne({
        where: {
          userId,
        },
      });
      return {
        ST: 200,
        EC: 0,
        EM: "ok",
        data: res,
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
  public createCoupon = async ({
    coupon,
    submitDate,
  }: {
    coupon: Icounpon;
    submitDate: string;
  }) => {
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
      const { discount, type, condition } = coupon;
      const findCouponExisted = await Coupon.findOne({
        where: {
          disCount: discount,
          type,
          condition,
        },
        nest: true,
        raw: true,
      });
      let isType = false;
      if (findCouponExisted) {
        if (
          findCouponExisted.status == "S2" &&
          findCouponExisted.dateTo != coupon.dateTo
        ) {
          await Coupon.update(
            {
              dateTo: coupon.dateTo,
              status: "S1",
            },
            {
              where: {
                id: findCouponExisted.id,
              },
              transaction: t,
            }
          );
          isType = true;
        }
      } else {
        console.log(coupon.dateTo + submitDate);
        const res = await Coupon.create(
          {
            ...coupon,
            dateTo: new Date(coupon.dateTo + submitDate),
          },
          {
            transaction: t,
          }
        );
        const timeDistant =
          new Date(res.dateTo).getTime() - new Date(res.createdAt).getTime();
        setValueWithTime(
          `couponId-${res.id}`,
          JSON.stringify(res),
          timeDistant
        );
        console.log(timeDistant);
      }

      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: isType
          ? "Update coupon successfully"
          : "Create coupon successfully",
      };
    } catch (error) {
      t.rollback();
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
  public getAllCoupon = async (query: any) => {
    try {
      const { page, limitPage } = query;
      let res: any;
      console.log(page, limitPage);
      if (+page == -1 && +limitPage == -1) {
        res = await Coupon.findAndCountAll({
          nest: true,
          raw: true,
        });
      } else {
        const limitEnv = process.env.limit;
        const newLimit = !limitPage ? limitEnv : limitPage;
        const newPage = !page ? 0 : page;
        const currentPage = +newPage * +newLimit;
        res = await Coupon.findAndCountAll({
          nest: true,
          raw: true,
          limit: +newLimit,
          offset: +currentPage,
        });
      }

      const status: {
        data: any[];
      } = {
        data: [],
      };
      const type: {
        data: any[];
      } = {
        data: [],
      };
      const [statusResponse, codeResponse] = await Promise.all([
        instance.get(`get-allcode?type=status`),
        instance.get(`get-allcode?type=code`),
      ]);
      status.data = statusResponse.data;
      type.data = codeResponse.data;

      const newArray: any[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        newArray.push(res.rows[i]);
        for (let j = 0; j < type?.data.length; j++) {
          if (res.rows[i].type == type.data[j].keyMap) {
            newArray[i].code_type = type.data[j];
            break;
          }
        }
        for (let k = 0; k < status.data.length; k++) {
          if (res.rows[i].status == status.data[k].keyMap) {
            newArray[i].code_status = status.data[k];
            break;
          }
        }
      }

      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: {
          rows: newArray,
          count: res.count,
        },
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
  public deleteCoupon = async (id: number) => {
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
      await Coupon.destroy({
        where: {
          id,
        },
        transaction: t,
      });
      t.commit();
      return {
        ST: 200,
        EM: "delete Coupon success",
        EC: 0,
      };
    } catch (error) {
      t.rollback();
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
  public updateCoupon = async (coupon: Icounpon) => {
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
      const { id, code_type, code_status, ...restObject } = coupon;
      const isExisted = await Coupon.findByPk(id);
      if (!isExisted) {
        return {
          ST: 404,
          EM: "Coupon invalid",
          EC: 1,
        };
      }
      await Coupon.update(
        {
          ...restObject,
        },
        {
          where: {
            id,
          },
          transaction: t,
        }
      );
      t.commit();
      return {
        ST: 200,
        EM: "Update Coupon successfully",
        EC: 0,
      };
    } catch (error) {
      t.rollback();
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
  public exChangeStateCoupon = async (id: number) => {
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
      await Coupon.update(
        {
          status: "S2",
        },
        {
          where: {
            id,
          },
          transaction: t,
        }
      );

      t.commit();
      return {
        EC: 0,
        EM: "Coupon expired",
      };
    } catch (error) {
      t.rollback();
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
}
export default new ServiceShop();

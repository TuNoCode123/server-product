import { Ishop } from "../interfaces/interface.product";
import Shop from "../models/model.Shop";
import { db } from "../server";

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
}
export default new ServiceShop();

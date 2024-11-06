import { where } from "sequelize";
import instance from "../helpers/axios";
import { Imailer, Iorder, ItotalCart } from "../interfaces/interface.order";
import { Iproduct } from "../interfaces/interface.product";
import infor_Product from "../models/model.inforpro";
import Order from "../models/model.order";
import Order_Items from "../models/model.order_Items";
import Payment from "../models/model.payment";
import { db } from "../server";
import serviceUser from "./service.user";
import _, { includes } from "lodash";
import Inventory from "../models/model.inventory";
import Shop from "../models/model.Shop";
import Products from "../models/model.product";
import Coupon_Order from "../models/model.coupon_Order";
import Coupon from "../models/model.coupon";
import { formatDate } from "../utils/formatDate";
import {
  generateEmailContent,
  generateEmailContentCancel,
  generateEmailContentPrePared,
  generateEmailContentShipping,
} from "../utils/formatContentMailer";
import { setValueWithTime } from "../utils/redis";
import Rating from "../models/model.rating";
import Comment from "../models/model.comment";
import Image_Comment from "../models/model.image_comment";
class OrderService {
  public createOrder = async (
    order: Iorder,
    items: any[],
    totalCart: ItotalCart
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
    // const t2 = await sequelize.transaction();
    // const t3 = await sequelize.transaction();
    try {
      const { userId } = order;
      const checkUserId = await serviceUser.getUserById(userId);
      if (checkUserId.EC == 1)
        return {
          ST: 404,
          EC: 1,
          EM: "USER NOT EXISTED",
        };

      const [statusPayment, statusOrder] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_PAYMENT`),
        instance.get(`get-allcode?type=STUTUS_ORDER`),
      ]);
      if (
        !statusPayment ||
        !statusOrder ||
        !statusPayment.data ||
        !statusOrder.data
      ) {
        throw new Error("statusPayment or StatusOrder not get");
      }
      // check quantity
      const result = await Promise.all(
        items.map(async (item) => {
          if (item.childProduct) {
            return await Inventory.findOne({
              where: {
                productId: item.product.id,
                productChildId: item.childProduct.id,
              },
              nest: true,
              raw: true,
            });
          } else if (!item.childProduct) {
            return await Inventory.findOne({
              where: {
                productId: item.product.id,
                productChildId: null,
              },
              nest: true,
              raw: true,
            });
          }
        })
      );

      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        if (item == null || item == undefined) {
          throw new Error("inventory note existed");
        }
        if (+item.quantity <= 0) {
          throw new Error(`product run out of quantity`);
        }
      }
      const isCreateOrder = await Order.create(
        {
          ...order,
          status: statusOrder.data[0].keyMap,
        },
        {
          transaction: t,
        }
      );
      if (!isCreateOrder)
        return {
          ST: 404,
          EC: 1,
          EM: "CREATE ORDER NOT COMPLTED",
        };
      // save payment for Order
      await Payment.create(
        {
          orderId: isCreateOrder.id,
          price: totalCart.totalPrices,
          status: statusPayment.data[0].keyMap,
          method: "Paypal",
          currency: "USD",
        },
        {
          transaction: t,
        }
      );
      // await t2.commit();
      const customItemOrder = items.map((item) => {
        return {
          productId: item.product.id,
          productChildId: item.childProduct ? item.childProduct.id : null,
          quantity: item.quantity,
          price: item.totalPrices,
          orderId: isCreateOrder.id,
          shopId: item.idShop,
        };
      });
      // save order_item for Order
      await Order_Items.bulkCreate(customItemOrder, {
        transaction: t,
      });
      //save coupon for Order
      const couponForOrder = [];
      if (totalCart.transportCode) {
        couponForOrder.push({
          couponId: totalCart.transportCode,
          orderId: isCreateOrder.id,
        });
      }
      if (totalCart.discountCode) {
        couponForOrder.push({
          couponId: totalCart.discountCode,
          orderId: isCreateOrder.id,
        });
      }
      if (couponForOrder.length > 0) {
        await Coupon_Order.bulkCreate(couponForOrder, {
          transaction: t,
        });
      }

      await t.commit();
      return {
        ST: 200,
        EM: "OK",
        EC: 0,
        data: {
          orderId: isCreateOrder.id,
        },
      };
    } catch (error) {
      console.log(error);
      await t.rollback();
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
  public makeOrderSuccess = async (orderId: number) => {
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
      const [statusPayment, statusOrder, statusOrderItems] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_PAYMENT`),
        instance.get(`get-allcode?type=STUTUS_ORDER`),
        instance.get(`get-allcode?type=STUTUS_ORDER_ITEM`),
      ]);

      // await Order.update(
      //   {
      //     status: statusOrder.data[1].keyMap,
      //   },
      //   {
      //     where: { id: orderId },
      //     transaction: t,
      //   }
      // );
      await Order_Items.update(
        {
          status: statusOrderItems.data[0].keyMap,
        },
        {
          where: { orderId },
          transaction: t,
        }
      );
      await Payment.update(
        {
          status: statusPayment.data[2].keyMap,
        },
        {
          where: { orderId: orderId },
          transaction: t,
        }
      );
      const listOrderItems = await Order_Items.findAll({
        where: {
          orderId,
        },
        raw: true,
        nest: true,
      });
      await Promise.all(
        listOrderItems.map(async (item) => {
          return await Inventory.update(
            {
              quantity: sequelize.literal(`quantity - ${item.quantity}`),
            },
            {
              where: {
                productId: item.productId,
                productChildId: item.productChildId,
              },
            }
          );
        })
      );
      if (
        !statusPayment ||
        !statusOrder ||
        !statusPayment.data ||
        !statusOrder.data
      ) {
        throw new Error("statusPayment or StatusOrder not get");
      }
      t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "SUCCESS",
      };
    } catch (error) {
      console.log(error);
      await t.rollback();
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
  public makeOrderFailed = async (orderId: number) => {
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
      const [statusPayment] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_PAYMENT`),
      ]);

      await Payment.update(
        {
          status: statusPayment.data[3].keyMap,
        },
        {
          where: { orderId: orderId },
          transaction: t,
        }
      );
      await t.commit();
      return {
        ST: 200,
        EC: 1,
        EM: "FAILED",
      };
    } catch (error) {
      await t.rollback();
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
  public makeOrderCancel = async (orderId: number) => {
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
      const [statusPayment] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_PAYMENT`),
      ]);

      await Payment.update(
        {
          status: statusPayment.data[4].keyMap,
        },
        {
          where: { orderId: orderId },
          transaction: t,
        }
      );
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "Cancel Order",
      };
    } catch (error) {
      await t.rollback();
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
  public getAllOrder = async (userId: number) => {
    try {
      const checkUserExisted = await serviceUser.getUserById(userId);
      if (checkUserExisted.EC == 1)
        return {
          ST: 404,
          EC: 1,
          EM: "User not existed",
        };
      const res = await Order.findAll({
        include: [
          {
            model: Order_Items,
            as: "items_Orders",
            include: [
              {
                model: Shop,
                as: "shop_Order",
              },
              {
                model: Products,
                as: "pro_Order",
              },
              {
                model: infor_Product,
                as: "infor_Order",
              },
            ],
          },
          // {
          //   model: Payment,
          //   as: "pay_Order",
          // },
        ],
        where: {
          userId,
        },
        // raw: true,
        // nest: true,
      });
      const [statusPayment, statusOrder] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_PAYMENT`),
        instance.get(`get-allcode?type=STUTUS_ORDER`),
      ]);
      const ordersWithItems = res.map((order) => order.toJSON());
      const newArray = await Promise.all(
        ordersWithItems.map(async (item) => {
          let status_allcode = "";
          let status_payment = "";
          statusOrder.data.map((k: any) => {
            if (item.status === k?.keyMap) {
              status_allcode = k;
            }
          });
          statusPayment.data.map((k: any) => {
            if (item?.pay_Order?.status == k?.keyMap) {
              status_payment = k;
            }
          });
          return {
            ...item,
            status_allcode,
            status_payment,
          };
        })
      );
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: newArray,
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
  public getDetailOrder = async (orderId: number) => {
    try {
      const exsitedOrder = await Order.findByPk(orderId, {
        include: [
          {
            model: Order_Items,
            as: "items_Orders",
            include: [
              {
                model: Shop,
                as: "shop_Order",
              },
              {
                model: Products,
                as: "pro_Order",
              },
              {
                model: infor_Product,
                as: "infor_Order",
              },
            ],
          },
          {
            model: Payment,
            as: "pay_Order",
          },
          {
            model: Coupon,
          },
        ],
      });
      if (!exsitedOrder) {
        return {
          ST: 404,
          EC: 1,
          EM: `Order isn't exsited`,
        };
      }
      const ordersWithItems = exsitedOrder.toJSON();

      // const res = await Order_Items.findOne({
      //   where: {
      //     orderId,
      //   },
      //   include: [
      //     {
      //       model: Shop,
      //       as: "shop_Order",
      //     },
      //     {
      //       model: Products,
      //       as: "pro_Order",
      //     },
      //     {
      //       model: infor_Product,
      //       as: "infor_Order",
      //     },
      //     {
      //       model: Order,
      //       as: "order_items",
      //       include: [
      //         {
      //           model: Coupon,
      //         },
      //         {
      //           model: Payment,
      //           as: "pay_Order",
      //         },
      //       ],
      //     },
      //   ],
      //   nest: true,
      //   raw: true,
      // });
      const [statusPayment, statusOrder, statusOrderItem] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_PAYMENT`),
        instance.get(`get-allcode?type=STUTUS_ORDER`),
        instance.get(`get-allcode?type=STUTUS_ORDER_ITEM`),
      ]);
      let status_Order = "";
      let status_Payment = "";
      statusOrder.data.map((sto: any) => {
        if (sto.keyMap == exsitedOrder.status) {
          status_Order = sto;
        }
      });
      statusPayment.data.map((stp: any) => {
        if (stp.keyMap == exsitedOrder.pay_Order.status) {
          status_Payment = stp;
        }
      });

      const temp = await Promise.all(
        ordersWithItems.items_Orders.map(async (item: any) => {
          let getComment: any;
          if (item.isComment == 1) {
            getComment = await Rating.findOne({
              where: {
                orderId: item.orderId,
                productId: item.productId,
                productChildId: item.productChildId,
              },
              include: [
                {
                  model: Comment,
                  as: "comment_rating",
                  where: { userId: ordersWithItems.userId },
                  include: [
                    {
                      model: Image_Comment,
                      as: "image_comment",
                    },
                  ],
                },
              ],
            });
          }
          return {
            ...item,
            status_Allcodes: statusOrderItem.data.filter(
              (status: any) => status.keyMap === item.status
            )[0],
            getComment,
          };
        })
      );

      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: {
          ...ordersWithItems,
          items_Orders: temp,
          status_Order,
          status_Payment,
        },
        // data: exsitedOrder,
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
  public cancelOrder = async (orderId: number) => {
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
      const isExistedOrder = await Order.findByPk(orderId);
      if (!isExistedOrder)
        return {
          ST: 404,
          EC: 1,
          EM: `ORDER ISN'T EXISTED`,
        };
      const [statusOrder] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_ORDER`),
      ]);
      await Order.update(
        {
          status: statusOrder.data[4].keyMap,
        },
        {
          where: {
            id: orderId,
          },
          transaction: t,
        }
      );
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "ORDER CANCELED SUCCESSFULLY",
      };
    } catch (error) {
      await t.rollback();
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
  public getAllOrderForShop = async (shopId: number) => {
    try {
      const checkShopExisted = await Shop.findByPk(shopId);
      if (!checkShopExisted)
        return {
          ST: 404,
          EC: 1,
          EM: "Shop not existed",
        };
      const res = await Order_Items.findAll({
        where: {
          shopId,
        },
        include: [
          {
            model: Products,
            as: "pro_Order",
          },
          {
            model: infor_Product,
            as: "infor_Order",
          },
        ],
      });
      const [statusOrder] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_ORDER_ITEM`),
      ]);
      let ordersWithItems: Order_Items[] = res.map((res) => res.toJSON());
      ordersWithItems = ordersWithItems.filter((item) => item.status != null);
      const newArray = await Promise.all(
        ordersWithItems.map(async (item) => {
          let status_allcode = "";
          statusOrder.data.map((k: any) => {
            if (item.status === k?.keyMap) {
              status_allcode = k;
            }
          });
          const orderParent = await Order.findByPk(item.orderId, {
            nest: true,
            raw: true,
          });
          let inventory: any;
          if (item.infor_Order) {
            const findQuantity = await Inventory.findOne({
              where: {
                productId: item.pro_Order.id,
                productChildId: item.infor_Order.id,
              },
            });
            inventory = findQuantity?.quantity;
            // item.pro_Order = "";
          } else {
            const findQuantity = await Inventory.findOne({
              where: {
                productId: item.pro_Order.id,
                productChildId: null,
              },
            });
            inventory = findQuantity?.quantity;
            // item.infor_Order = "";
          }
          if (!orderParent) {
            return {
              ...item,
              status_allcode,
            };
          }
          const findGuess = await serviceUser.getUserById(+orderParent.userId);
          return {
            ...item,
            createdAt: formatDate(item.createdAt),
            status_allcode,
            guess: {
              id: findGuess.data.id,
              email: findGuess.data.email,
              firstName: findGuess.data?.firstName,
              lastName: findGuess.data?.lastName,
              phoneNumber: findGuess.data?.phoneNumber,
              address: findGuess.data?.address,
              gender: findGuess.data?.gender,
            },
            inventory,
          };
        })
      );

      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: newArray,
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
  public stansmissState = async (dataBody: any) => {
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
      const {
        orderItemId,
        orderId,
        note,
        state,
        guess,
        shopId,
        stateVn,
        product,
      } = dataBody;

      if (!orderItemId || !state || !stateVn) {
        return {
          ST: 404,
          EC: 1,
          EM: "MISSING INPUT",
        };
      }
      const isExistedOrder = await Order.findByPk(orderId);
      if (!isExistedOrder)
        return {
          ST: 404,
          EC: 1,
          EM: `ORDER ISN'T EXISTED`,
        };
      const [statusOrder, statusOrderItem] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_ORDER`),
        instance.get(`get-allcode?type=STUTUS_ORDER_ITEM`),
      ]);

      const findAllcode = statusOrderItem.data.filter((item: any) =>
        item.valueEn.includes(state)
      );
      if (findAllcode.length <= 0) {
        return {
          ST: 400,
          EC: 1,
          EM: "STATUS NOT MATCH",
        };
      }
      const res = await Order_Items.update(
        {
          status: findAllcode[0].keyMap,
          note: note,
        },
        {
          where: {
            id: orderItemId,
          },
          transaction: t,
        }
      );
      if (res[0] > 0) {
        if (state == "Prepared") {
          await Order.update(
            {
              status: "SO2",
            },
            {
              where: { id: orderId },
              transaction: t,
            }
          );
        }
        if (state == "Voided") {
          await Order.update(
            {
              status: "SO5",
            },
            {
              where: { id: orderId },
              transaction: t,
            }
          );
        }
        if (state == "Shipping") {
          await Order.update(
            {
              status: "SO3",
            },
            {
              where: { id: orderId },
              transaction: t,
            }
          );
          // set time ship
          const setMemOrder = await setValueWithTime(
            `itemOrder-${orderId}-${orderItemId}`,
            orderId,
            20
          );

          if (setMemOrder.EC == 1) {
            throw new Error("Set mem failed");
          }
        }
        await t.commit();
        const findShop = await Shop.findByPk(shopId);
        if (!findShop) {
          return {
            ST: 404,
            EC: 1,
            EM: "SHOP NOT existed",
          };
        }
        const mailer: Imailer = {
          from: `Cửa hàng ${findShop.name} "<your-email@example.com>"`,
          to: guess.email,
          subject: `${stateVn} đơn hàng của quý khách`,
          html:
            state == "Voided"
              ? generateEmailContentCancel(
                  `${guess.firstName}${guess.lastName}`,
                  orderId,
                  findShop.name,
                  {
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                  },
                  stateVn,
                  note
                )
              : state == "Prepared"
              ? generateEmailContentPrePared(
                  `${guess.firstName}${guess.lastName}`,
                  orderId,
                  findShop.name,
                  {
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                  }
                )
              : state == "Shipping"
              ? generateEmailContentShipping(
                  `${guess.firstName}${guess.lastName}`,
                  orderId,
                  findShop.name,
                  {
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                  }
                )
              : "",
        };
        //as xu ly
        serviceUser.sendMailerForUser(mailer);
      }

      return {
        ST: 200,
        EC: 0,
        EM: res[0] > 0 ? `${dataBody.state} successsfully` : "dont effect rows",
      };
    } catch (error) {
      await t.rollback();
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
export default new OrderService();

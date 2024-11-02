import { Redis } from "ioredis";
import Coupon from "../models/model.coupon";
import serviceShop from "../services/service.shop";
import Order_Items from "../models/model.order_Items";
import { getValue } from "../utils/redis";
import Order from "../models/model.order";
const STATE_REDIS = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnect",
  ERROR: "error",
};

const logsStateCurrentRedis = (redis: Redis) => {
  if (!redis) {
    console.log("paramater redis not existed");
    return;
  }
  redis.on(STATE_REDIS.CONNECT, () => {
    console.log("Connecting redis ");
  });
  redis.on(STATE_REDIS.RECONNECT, () => {
    console.log("Reconnecting redis ");
  });
  redis.on(STATE_REDIS.END, () => {
    console.log("Disconnected redis ");
  });
  redis.on(STATE_REDIS.ERROR, (error: any) => {
    console.error("Lỗi kết nối Redis:", error);
  });
};
const redisCore: { redis?: Redis } = {};
const initRedis = async () => {
  const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });
  redisCore.redis = redis;
  const sub = redisCore.redis.duplicate();
  if (!sub) {
    console.error("Không thể tạo kết nối sao chép Redis.");
    return;
  }
  // register event on redis
  await sub.config("SET", "notify-keyspace-events", "Ex");
  sub.subscribe("__keyevent@0__:expired", (err) => {
    if (err) {
      console.error("Lỗi khi đăng ký sự kiện:", err);
    } else {
      console.log("Đã đăng ký sự kiện hết hạn.");
    }
  });

  // Xử lý sự kiện hết hạn
  sub.on("message", async (channel, key) => {
    try {
      if (channel === "__keyevent@0__:expired") {
        if (key.startsWith("coupon")) {
          const id = key.split("-")[1];
          const res = await serviceShop.exChangeStateCoupon(+id);
          console.log(res.EM);
        }
        if (key.startsWith("itemOrder")) {
          const id = key.split("-")[2];
          const orderId = key.split("-")[1];
          await Order_Items.update(
            {
              status: "SOI4",
            },
            {
              where: {
                id,
              },
            }
          );
          const isCheckVoided = await Order.findOne({
            where: {
              id: orderId,
            },
            nest: true,
            raw: true,
          });
          if (!isCheckVoided) throw new Error("order not existed");
          if (isCheckVoided.status === "SO5") {
            throw new Error(`order'state is voided`);
          }
          const listItems = await Order_Items.findAll({
            where: {
              orderId: orderId,
            },
          });
          if (listItems.length <= 0)
            throw new Error("order item of orderId not existed");
          const isCheckComplete = listItems.filter(
            (item) => item.status == "SOI4"
          );
          if (isCheckComplete.length == listItems.length) {
            await Order.update(
              {
                status: "SO4",
              },
              {
                where: { id: orderId },
              }
            );
            return;
          }
          const getAllStateExceptComplete = listItems.filter(
            (item) => item.status != "SOI4"
          );
          if (getAllStateExceptComplete.length <= 0)
            throw new Error("State for Order Item clearly");
          let labelSecondeRank: string = "";
          let MIN_NUMBER = -9999999;
          for (let item of getAllStateExceptComplete) {
            const getState = Number(item.status.slice(-1));
            if (getState > MIN_NUMBER) {
              MIN_NUMBER = getState;
              labelSecondeRank = item.status;
            }
          }
          if (labelSecondeRank == "") throw new Error("ranking not existed");
          const statusForOrder =
            labelSecondeRank.slice(0, 2) + labelSecondeRank.slice(-1);
          await Order.update(
            {
              status: statusForOrder,
            },
            {
              where: { id: orderId },
            }
          );
          console.log("expired order");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      console.log("error at redis");
    }
  });
  logsStateCurrentRedis(redis);
};
const getRedis = () => redisCore;
export { initRedis, getRedis };

import { getRedis } from "../config/configRedis";

export const getValue = async (label: string) => {
  try {
    const { redis } = getRedis();
    if (!redis) throw Error("redis not found");
    const result = await redis.get(label);
    if (!result) {
      return {
        EC: 1,
        EM: "redis not found",
      };
    }
    return {
      EC: 0,
      EM: "OK",
      data: result,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    console.log(error);
    return {
      EC: 99,
    };
  }
};
export const setValue = async (label: string, value: string) => {
  try {
    const { redis } = getRedis();
    if (!redis) throw Error("redis not found");
    await redis.set(label, value, "EX", 150);
    return {
      EC: 0,
      EM: "OK",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    console.log(error);
    return {
      EC: 99,
    };
  }
};
export const deleteValue = async (label: string) => {
  try {
    const { redis } = getRedis();
    if (!redis) throw Error("redis not found");
    const result = await redis.del(label);
    if (!result) {
      return {
        EC: 1,
        EM: `redis not found ${label}`,
      };
    }
    return {
      EC: 0,
      EM: "OK",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    console.log(error);
    return {
      EC: 99,
    };
  }
};
//
export const redisLabel = {
  PRODUCT: "product",
};

import { Redis } from "ioredis";
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
const initRedis = () => {
  const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });
  redisCore.redis = redis;
  logsStateCurrentRedis(redis);
};
const getRedis = () => redisCore;
export { initRedis, getRedis };

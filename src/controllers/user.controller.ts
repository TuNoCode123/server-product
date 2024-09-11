import { Request, Response } from "express";
import { badRequest, notFound } from "../helpers/err";
import { checkVarErr } from "../utils/error";
import serviceUser from "../services/service.user";
import { getRedis } from "../config/configRedis";
import { Iuser } from "../interfaces/interface.user";
import { deleteValue } from "../utils/redis";

class UserController {
  public addUser = async (req: Request, res: Response) => {
    try {
      await deleteValue("response");
      console.log("--->", req.body);
      const response = await serviceUser.addUser(req.body);
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(error.message, res);
      }
    }
  };
  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const clientRedis = getRedis();
      const { redis } = clientRedis;
      if (redis) {
        const getUsersInMem = await redis.get("response");
        if (getUsersInMem) {
          const response = JSON.parse(getUsersInMem);
          const { status, ...restObject } = response;
          return res.status(status || 500).json(restObject);
        }
      }
      const response = await serviceUser.getAllUsers();
      await redis?.set("response", JSON.stringify(response), "EX", 60);
      const { status, ...restObject } = response;
      return res.status(status || 500).json(restObject);
    } catch (error) {
      return res.status(400).json({
        EC: 1,
        EM: error,
      });
    }
  };
  public deleteUserById = async (req: Request, res: Response) => {
    const { id } = req.query;
    try {
      if (!id) {
        return notFound("id not found", res);
      }
      await deleteValue("response");
      const response = await serviceUser.delUserById(+id);
      const { status, ...restObject } = response;
      return res.status(status || 500).json(restObject);
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(error.message, res);
      }
    }
  };
  public updateUser = async (req: Request, res: Response) => {
    try {
      await deleteValue("response");
      const response = await serviceUser.updateUser(req.body);
      const { status, ...restObject } = response;
      return res.status(status || 500).json(restObject);
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(error.message, res);
      }
    }
  };
  public getUserById = async (req: Request, res: Response) => {
    try {
      const response = await serviceUser.getUserById(+req.query);
      const { status, ...restObject } = response;
      return res.status(status || 500).json(restObject);
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(error.message, res);
      }
    }
  };
}
export default new UserController();

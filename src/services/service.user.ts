import instance from "../helpers/axios";

import { Iresponse } from "../interfaces/interface.res";
import { Iuser } from "../interfaces/interface.user";

class ServiceUser {
  public addUser = async (user: any): Promise<Iresponse<any>> => {
    try {
      const { cloudinaryUrls, ...restObject } = user;
      if (cloudinaryUrls) {
        const response: Iresponse<any> = await instance.post("/singup", {
          ...restObject,
          image: user.cloudinaryUrls[0],
        });
        return response;
      }
      const response: Iresponse<any> = await instance.post("/singup", {
        ...restObject,
      });
      return response;
    } catch (error) {
      if (error instanceof Error)
        return {
          EC: 1,
          EM: error.message,
          data: "",
        };

      return {
        EC: 1,
        EM: "Unknown error occurred",
        data: "",
      };
    }
  };
  public getAllUsers = async (): Promise<Iresponse<any>> => {
    try {
      const response: Iresponse<any> = await instance.get("/get-all-user");
      return response;
    } catch (error) {
      if (error instanceof Error)
        return {
          EC: 1,
          EM: error.message,
          data: "",
        };

      return {
        EC: 1,
        EM: "Unknown error occurred",
        data: "",
      };
    }
  };
  public delUserById = async (id: number): Promise<Iresponse<any>> => {
    try {
      const response: Iresponse<any> = await instance.delete(
        `del-user-by-id?id=${id}`
      );
      return response;
    } catch (error) {
      if (error instanceof Error)
        return {
          EC: 1,
          EM: error.message,
          data: "",
        };

      return {
        EC: 1,
        EM: "Unknown error occurred",
        data: "",
      };
    }
  };
  public updateUser = async (user: Iuser): Promise<Iresponse<any>> => {
    try {
      const response: Iresponse<any> = await instance.put(`update-user`, {
        ...user,
      });
      return response;
    } catch (error) {
      if (error instanceof Error)
        return {
          EC: 1,
          EM: error.message,
          data: "",
        };

      return {
        EC: 1,
        EM: "Unknown error occurred",
        data: "",
      };
    }
  };
  public getUserById = async (id: number): Promise<Iresponse<any>> => {
    try {
      const response: Iresponse<any> = await instance.get(
        `get-user-by-id?id=${id}`
      );
      return response;
    } catch (error) {
      if (error instanceof Error)
        return {
          EC: 1,
          EM: error.message,
          data: "",
        };

      return {
        EC: 1,
        EM: "Unknown error occurred",
        data: "",
      };
    }
  };
}
export default new ServiceUser();

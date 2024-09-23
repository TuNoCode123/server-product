import instance from "../helpers/axios";

import { Iresponse } from "../interfaces/interface.res";
import { deteteImageFromClound } from "../utils/deleteImage";

class ServiceUser {
  public addUser = async (user: any): Promise<Iresponse<any>> => {
    try {
      const { cloudinaryUrls, id_cloundinary, ...restObject } = user;
      if (cloudinaryUrls) {
        const response: Iresponse<any> = await instance.post("/singup", {
          ...restObject,
          image: user.cloudinaryUrls[0],
          publicId: id_cloundinary,
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
  public getAllUsers = async (pagination: any): Promise<Iresponse<any>> => {
    try {
      const { page, limitPage } = pagination;

      const response: Iresponse<any> = await instance.get(
        `/get-all-user?page=${page}&limitPage=${limitPage}`
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
  public delUserById = async (id: number): Promise<Iresponse<any>> => {
    try {
      const response: Iresponse<any> = await instance.delete(
        `del-user-by-id?id=${id}`
      );
      await deteteImageFromClound(response.data);
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
  public updateUser = async ({
    cloudinaryUrls,
    ...restObject
  }: any): Promise<Iresponse<any>> => {
    try {
      let response: Iresponse<any>;
      if (cloudinaryUrls && cloudinaryUrls.length > 0) {
        response = await instance.put(`update-user`, {
          ...restObject,
          image: cloudinaryUrls[0],
        });
        await deteteImageFromClound(response.data);
        return response;
      }
      response = await instance.put(`update-user`, {
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

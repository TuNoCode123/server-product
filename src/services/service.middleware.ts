import instance from "../helpers/axios";

class MiddleWareServices {
  public verifyUser = async (token: any) => {
    try {
      const res: any = await instance.get("/verify-user", {
        headers: {
          //   Authorization: `Bearer ${token}`,
          Authorization: token,
        },
      });
      return res;
    } catch (error) {}
  };
}
export default new MiddleWareServices();

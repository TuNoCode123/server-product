import axios from "axios";

import dbChat from "../server2/models/chat";
import dbRoom from "../server2/models/room";

import serviceUser from "./service.user";
import moment from "moment-timezone";
import {
  deteteImageFromClound,
  deteteImageFromCloundRaw,
  getPublicId,
} from "../utils/deleteImage";

class ChatService {
  getChatById = async (id: any) => {
    try {
      const res = await dbRoom.find({
        members: { $in: [+id] },
      });

      if (res.length > 0) {
        const getRole = await serviceUser.getUserById(id);
        if (getRole.EC == 1) throw new Error("user not existed");

        const getListPartner = res.map((item) =>
          item.members.find((m) => m != id)
        );

        let list: any;
        if (getRole.data.roleId == "R3") {
          const res = await Promise.all(
            getListPartner.map((p) => {
              return axios.get(
                `http://localhost:8888/api/v1/find-shop?userId=${p}`
              );
            })
          );
          list = res.map((response: any) => response.data.data);
        } else {
          const res = await Promise.all(
            getListPartner.map((p) => {
              return serviceUser.getUserById(p);
            })
          );
          list = res.map((response) => response.data);
        }

        return {
          ST: 200,
          EC: 0,
          EM: "OK",
          data: list,
        };
      }
      return {
        ST: 200,
        EC: 0,
        EM: `DON'T ANY CHAT`,
        data: [],
      };
    } catch (error) {
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
          data: [],
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
        data: [],
      };
    }
  };
  createMess = async ({
    roomId,
    senderId,
    text,
    cloudinaryUrls,
  }: {
    roomId: any;
    senderId: any;
    text: any;
    cloudinaryUrls?: any;
  }) => {
    try {
      console.log("------>", senderId);
      const isExitedRoom = await dbRoom.findOne({
        _id: roomId,
      });
      if (isExitedRoom == null) throw new Error("Room not exsted");
      const isExitedSenderIntoRoom = await dbRoom.findOne({
        members: { $in: [+senderId] },
      });
      if (isExitedSenderIntoRoom == null) throw new Error("Member not exsted");
      const res = new dbChat({
        roomId,
        senderId,
        text,
        image: cloudinaryUrls?.length > 0 ? cloudinaryUrls[0] : null,
      });
      await res.save();
      return {
        ST: 200,
        EC: 0,
        EM: "CREATE CHAT SUCCESSFULLY",
        data: res,
      };
    } catch (error) {
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
      };
    }
  };
  findAllMess = async (userId: number, partner: number) => {
    try {
      const room = await dbRoom.findOne({
        members: { $all: [+userId, +partner] },
      });
      if (room == null) throw new Error("Room not existed");
      const res = await dbChat.find({
        roomId: room._id,
      });
      const plainMessage = res.map((item) => item.toJSON());
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: {
          roomId: room._id,
          messages: plainMessage.map((item) => {
            return {
              ...item,
              selected: false,
              createdAt: moment(new Date(item.createdAt))
                .tz("Asia/Bangkok")
                .format("HH:mm, DD/MM/YYYY"),
            };
          }),
        },
      };
    } catch (error) {
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
      };
    }
  };
  findChat = async (id1: any, id2: any) => {
    try {
      const res = await dbRoom.findOne({
        members: { $all: [+id1, +id2] },
      });

      return {
        ST: 200,
        EC: 0,
        EM: "OKE",
        data: res,
      };
    } catch (error) {
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
      };
    }
  };
  createRoom = async (userId1: number, userId2: number) => {
    try {
      const findRoom = await dbRoom.findOne({
        members: { $all: [userId1, userId2] },
      });
      if (findRoom) {
        return {
          ST: 200,
          EC: 0,
          EM: "EXISTED",
        };
      }
      const newRoom = new dbRoom({
        members: [userId1, userId2],
      });
      await newRoom.save();
      return {
        ST: 200,
        EC: 0,
        EM: "CREATE ROOM SUCCESSFULLY",
      };
    } catch (error) {
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
      };
    }
  };
  updateMess = async (data: {
    _id: any;
    text: any;
    senderId: any;
    roomId: any;
    type?: any;
  }) => {
    try {
      if (!data._id || !data.senderId || !data.roomId)
        throw new Error("MISSING INPUT");
      const isExistedUser = await serviceUser.getUserById(data.senderId);
      if (isExistedUser.EC == 1) throw new Error("user not existed");
      const isExistedRoom = await dbRoom.findOne({
        _id: data.roomId,
      });
      if (isExistedRoom == null) throw new Error("Room not existed");

      const isExistedChat = await dbChat.findOne({
        _id: data._id,
      });
      if (isExistedChat == null) throw new Error("Message not existed");
      if (data.type) {
        const res = await dbChat.deleteOne({
          _id: data._id,
        });
        if (res.deletedCount > 0) {
          if (isExistedChat.image) {
            await deteteImageFromCloundRaw(getPublicId(isExistedChat.image));
          }
        }
      } else {
        await dbChat.updateOne(
          {
            _id: data._id,
          },
          {
            $set: { text: data.text },
          }
        );
      }

      return {
        ST: 200,
        EC: 0,
        EM: "SUCCESS",
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
      };
    }
  };
  getAllCuscomer = async (shopId: number) => {
    try {
      // const isExitedShop = await serviceShop.findShop(shopId);
      // if (isExitedShop.EC == 1) throw new Error("Shop not existed");
      // const getAllCustomer= await serviceComment.
    } catch (error) {
      if (error instanceof Error)
        return {
          ST: 400,
          EC: 1,
          EM: error.message,
        };

      return {
        ST: 400,
        EC: 1,
        EM: "Unknown error occurred",
      };
    }
  };
}
export default new ChatService();

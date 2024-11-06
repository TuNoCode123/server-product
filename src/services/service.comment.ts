import { raw } from "express";
import { Iratinng } from "../interfaces/interface.user";
import Order from "../models/model.order";
import { db } from "../server";
import serviceUser from "./service.user";
import Products from "../models/model.product";
import infor_Product from "../models/model.inforpro";
import Order_Items from "../models/model.order_Items";
import Rating from "../models/model.rating";
import instance from "../helpers/axios";
import Comment from "../models/model.comment";
import Image_Comment from "../models/model.image_comment";
import { where } from "sequelize";
import { deteteImageFromClound } from "../utils/deleteImage";
import { Sequelize } from "sequelize-typescript";

class CommentService {
  public createRating = async ({
    comment,
    cloudinaryUrls,
    publicIds,
  }: {
    cloudinaryUrls?: any[];
    publicIds?: any[];
    comment: Iratinng;
  }) => {
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
      if (
        !comment ||
        !comment.userId ||
        !comment.productId ||
        !comment.orderId ||
        !comment.star ||
        !comment.comment
      )
        throw new Error("missing input");
      //check existed user
      const isExisteduser = await serviceUser.getUserById(comment.userId);
      if (isExisteduser.EC == 1) throw new Error("User not existed");
      const isExistedOrder = await Order.findByPk(comment.orderId, {
        raw: true,
      });
      if (!isExistedOrder) throw new Error("order not existed");
      //check user have sell order
      if (isExistedOrder.userId != isExisteduser.data.id)
        throw new Error("user not sell this order");
      if (!comment.productChildId) {
        const isExistedProduct = await Products.findByPk(comment.productId);
        if (!isExistedProduct) throw new Error("Product not existed");
      }
      const isExistedProductChild = await infor_Product.findByPk(
        comment.productChildId
      );
      if (!isExistedProductChild) throw new Error("Product Child not existed");
      const isExistedOrderItem = await Order_Items.findOne({
        where: {
          productId: comment.productId,
          productChildId: comment.productChildId
            ? comment.productChildId
            : null,
          orderId: comment.orderId,
          status: "SOI4",
        },
      });
      if (!isExistedOrderItem) throw new Error("order item invalid");
      const [statusStar] = await Promise.all([
        instance.get(`get-allcode?type=STAR`),
      ]);
      if (!statusStar || !statusStar.data)
        throw new Error("get Status Start failed");
      let star: any;
      for (let item of statusStar.data) {
        const getNumber = item.keyMap.slice(-1);
        if (comment.star == +getNumber) {
          star = item.keyMap;
          break;
        }
      }
      if (!star) throw new Error("start no match");

      const isExistedRating = await Rating.findOne({
        where: {
          orderId: comment.orderId,
          productId: comment.productId,
          productChildId: comment.productChildId,
        },
      });
      let commentId: any = undefined;
      if (isExistedRating) {
        await Rating.update(
          {
            productId: comment.productId,
            productChildId: comment?.productChildId,
            orderId: comment.orderId,
            star: star,
            totalLike: 0,
            totalResponse: 0,
          },
          {
            where: {
              id: isExistedRating.id,
            },
            transaction: t,
          }
        );
        const findComment = await Comment.findOne({
          where: {
            userId: comment.userId,
            ratingId: isExistedRating.id,
          },
          raw: true,
        });
        commentId = findComment?.id;
        if (findComment) {
          const isCreateComment = await Comment.update(
            {
              userId: comment.userId,
              ratingId: isExistedRating.id,
              firstName: isExisteduser.data?.firstName,
              lastName: isExisteduser.data?.lastName,
              image: isExisteduser.data?.image,
              content: comment.comment,
              parentId: null, // root comment
            },
            {
              where: {},
              transaction: t,
            }
          );
          if (
            comment.removeImageExisted &&
            comment.removeImageExisted.length > 0
          ) {
            await Promise.all(
              comment.removeImageExisted.map(async (item: any) => {
                const publicId = `uploads/${
                  item.split("uploads/")[1].split(".")[0]
                }`;
                const res = await Image_Comment.destroy({
                  where: {
                    publicId,
                  },
                  transaction: t,
                });
                if (res > 0) await deteteImageFromClound(publicId);
                return 1;
              })
            );
          }
        }
      } else {
        const isCreateRating = await Rating.create(
          {
            productId: comment.productId,
            productChildId: comment?.productChildId,
            orderId: comment.orderId,
            star: star,
            totalLike: 0,
            totalResponse: 0,
          },
          {
            transaction: t,
          }
        );
        if (!isCreateRating) throw new Error("create rating Failed");
        const isCreateComment = await Comment.create(
          {
            userId: comment.userId,
            ratingId: isCreateRating.id,
            firstName: isExisteduser.data?.firstName,
            lastName: isExisteduser.data?.lastName,
            image: isExisteduser.data?.image,
            content: comment.comment,
            parentId: null, // root comment
          },
          {
            transaction: t,
          }
        );

        if (!isCreateComment) throw new Error("create comment Failed");
        commentId = isCreateComment.id;
        // update state order item
        if (!comment.productChildId) {
          await Order_Items.update(
            {
              isComment: 1,
            },
            {
              where: {
                orderId: comment.orderId,
                productId: comment.productId,
              },
              transaction: t,
            }
          );
        } else {
          await Order_Items.update(
            {
              isComment: 1,
            },
            {
              where: {
                orderId: comment.orderId,
                productId: comment.productId,
                productChildId: comment.productChildId,
              },
              transaction: t,
            }
          );
        }
      }
      if (
        cloudinaryUrls &&
        cloudinaryUrls.length > 0 &&
        publicIds &&
        publicIds.length > 0
      ) {
        if (cloudinaryUrls.length != publicIds.length)
          throw new Error("image not match");
        await Promise.all(
          cloudinaryUrls.map(async (item, index) => {
            await Image_Comment.create(
              {
                commentId: commentId,
                image: item,
                publicId: publicIds[index],
              },
              {
                transaction: t,
              }
            );
          })
        );
      }
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "create rating success",
      };
    } catch (error) {
      await t.rollback();
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
  public getAllComment = async (productId: number) => {
    try {
      const res = await Rating.findAll({
        where: {
          productId,
        },
        include: [
          {
            model: Comment,
            as: "comment_rating",
            include: [
              {
                model: Image_Comment,
                as: "image_comment",
              },
            ],
          },
          {
            model: infor_Product,
            as: "infoPro_Comment",
          },
          {
            model: Order,
            as: "order_Comment",
          },
        ],
      });

      if (res.length <= 0) {
        return {
          ST: 404,
          EM: "producId not Comment",
          EC: 1,
        };
      }
      const listStarWithRaw: any[] = res.map((row) => row.toJSON());

      const [statusStar] = await Promise.all([
        instance.get(`get-allcode?type=STAR`),
      ]);
      const newArray = await Promise.all(
        listStarWithRaw.map(async (item) => {
          const userId = item?.comment_rating[0]?.userId;
          const findItems = statusStar.data.find(
            (i: any) => i.keyMap == item.star
          );
          const user = await serviceUser.getUserById(userId);

          const countStar = await Comment.findAndCountAll({
            where: {
              userId: userId,
            },
          });
          const result: any = await Comment.findAll({
            attributes: [
              "userId", // Lấy userId từ Comment
              [
                Sequelize.fn("sum", Sequelize.col("rating_comment.totalLike")),
                "totalLikes",
              ], // Tính tổng totalLike từ Rating
            ],
            include: [
              {
                model: Rating, // Kết nối với Rating
                as: "rating_comment", // Đảm bảo tên alias khớp với định nghĩa trong mối quan hệ
                attributes: [], // Không cần cột khác từ Rating
              },
            ],
            where: {
              userId: userId, // Lọc theo userId
            },

            group: ["Comment.userId"], // Nhóm theo userId từ bảng Comment
          });
          const resultRaw: any[] = result.map((row: any) => row.toJSON());
          if (findItems) {
            return {
              ...item,
              allcode_star: findItems,
              user: {
                ...user.data,
                totalLike:
                  resultRaw.length > 0
                    ? Number(resultRaw[0].totalLikes)
                    : "none",
                totalComment: countStar.count,
              },
            };
          }
          return {
            ...item,
            user: {
              ...user.data,
              totalLike:
                resultRaw.length > 0 ? Number(resultRaw[0].totalLikes) : "none",
              totalComment: countStar.count,
            },
          };
        })
      );
      return {
        ST: 200,
        EM: "OK",
        EC: 0,
        data: newArray,
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
  public deleteRating = async (ratingId: number) => {
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
      const isExistedRating = await Rating.findByPk(ratingId, {
        raw: true,
      });
      if (!isExistedRating) throw new Error("Rating not existed");
      const isDeleteRating = await Rating.destroy({
        where: {
          id: ratingId,
        },
        transaction: t,
      });
      if (!isDeleteRating) throw new Error("delete not completed");
      const findingCommentOfRating = await Comment.findOne({
        where: {
          ratingId,
        },
      });
      if (findingCommentOfRating) {
        const isDeletedComment = await Comment.destroy({
          where: {
            ratingId,
          },
          transaction: t,
        });
        // console.log("----->", isDeletedComment);
        // if (!isDeletedComment) throw new Error("Delete Comment not complete");
        //delete comment image
        const allImage = await Image_Comment.findAll({
          where: {
            commentId: findingCommentOfRating.id,
          },
          raw: true,
        });
        if (allImage && allImage.length > 0) {
          await Promise.all(
            allImage.map(async (item) => {
              const res = await Image_Comment.destroy({
                where: {
                  commentId: findingCommentOfRating.id,
                },
                transaction: t,
              });
              if (res > 0) await deteteImageFromClound(item.publicId);
              return 1;
            })
          );
        }
      }
      // update item state
      const res = await Order_Items.update(
        {
          isComment: 0,
        },
        {
          where: {
            productId: isExistedRating.productId,
            productChildId: isExistedRating.productChildId,
          },
          transaction: t,
        }
      );
      if (!res) throw new Error("state of product not change");
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "DELETE YOUR COMMENT SUCCESSFULLY",
      };
    } catch (error) {
      await t.rollback();
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
  public getAllStar = async (productId: number) => {
    try {
      const isExistedProduct = await Products.findByPk(productId);
      if (!isExistedProduct) throw new Error("Product not existed");
      const listRating = await Rating.findAll({
        attributes: [
          "star",
          [Sequelize.fn("COUNT", Sequelize.col("star")), "count"],
        ],
        group: ["star"],
        where: {
          productId,
        },
      });

      const listRatingWithRaw: any[] = listRating.map((row) => row.toJSON());
      const [statusOrder] = await Promise.all([
        instance.get(`get-allcode?type=STAR`),
      ]);

      const statisticalStar = statusOrder.data.map((item: any) => {
        const findItems = listRatingWithRaw.find((r) => r.star == item.keyMap);
        if (findItems) {
          return {
            ...findItems,
            star: Number(findItems.star.slice(-1)),
            count: Number(findItems?.count),
          };
        }
        return {
          star: Number(item.keyMap.slice(-1)),
          count: 0,
        };
      });
      const sortedArr = statisticalStar.sort(
        (a: any, b: any) => b.star - a.star
      );
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: sortedArr,
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
}
export default new CommentService();

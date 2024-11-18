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
import { col, fn, literal, Op, or, where } from "sequelize";
import { deteteImageFromClound } from "../utils/deleteImage";
import { Sequelize } from "sequelize-typescript";
import Liker from "../models/model.liker";
import Shop from "../models/model.Shop";
import Seller from "../models/model.inforSeller";
import Reply from "../models/model.reply";
import { calChangePercent, getDate } from "../utils/time";
import moment from "moment-timezone";
import { formatCurrency } from "../utils/formatDate";
import Category from "../models/model.category";
import { getParentCate } from "../utils/getParentCate";
import _ from "lodash";

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
  public getAllComment = async (
    productId: number,
    page: number,
    limit?: any
  ) => {
    try {
      const limitEnv = process.env.limit;
      if (!limitEnv) throw new Error("ENV not ready");
      const newLimit = limit ?? +limitEnv;
      const newPage = page ?? 0;
      const currentPage = +newPage * (+newLimit + 1);
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

              {
                model: Reply,
                as: "replies_Comment",
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
          {
            model: Liker,
            as: "rating_liker",
          },
        ],
        limit: newLimit,
        offset: currentPage,
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
          if (item?.comment_rating.length > 0) {
            // Sử dụng Promise.all để chờ tất cả các comment_Rating của item
            const updatedComments = await Promise.all(
              item.comment_rating.map(async (c: any) => {
                const userId = c.userId;
                const shopId =
                  c.replies_Comment.length > 0
                    ? c.replies_Comment[0].userId
                    : null;
                const findItems = statusStar.data.find(
                  (i: any) => i.keyMap == item.star
                );
                const user = await serviceUser.getUserById(userId);
                if (user.EC == 1) throw new Error(user.EM);

                const countStar = await Comment.findAndCountAll({
                  where: { userId },
                });

                const result: any = await Comment.findAll({
                  attributes: [
                    "userId",
                    [
                      Sequelize.fn(
                        "sum",
                        Sequelize.col("rating_comment.totalLike")
                      ),
                      "totalLikes",
                    ],
                  ],
                  include: [
                    {
                      model: Rating,
                      as: "rating_comment",
                      attributes: [],
                    },
                  ],
                  where: { userId },
                  group: ["Comment.userId"],
                });

                const shop = shopId
                  ? await Shop.findOne({
                      where: { userId: shopId },
                    })
                  : null;

                const resultRaw: any[] = result.map((row: any) => row.toJSON());

                if (findItems) {
                  return {
                    ...c,
                    allcode_star: findItems,
                    user: {
                      ...user.data,
                      totalLike:
                        resultRaw.length > 0
                          ? Number(resultRaw[0].totalLikes)
                          : "none",
                      totalComment: countStar.count,
                    },
                    shop,
                  };
                }

                return {
                  ...c,
                  user: {
                    ...user.data,
                    totalLike:
                      resultRaw.length > 0
                        ? Number(resultRaw[0].totalLikes)
                        : "none",
                    totalComment: countStar.count,
                  },
                  shop,
                };
              })
            );

            // Trả về item với comment_Rating đã được cập nhật
            return { ...item, comment_rating: updatedComments };
          }
          return item;
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
  public likeComment = async (ratingId: number, userId: number) => {
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
      const isExistedRating = await Rating.findByPk(ratingId);
      if (!isExistedRating) throw new Error("Rating not existed");
      const isExistedUser = await serviceUser.getUserById(userId);
      if (isExistedUser.EC == 1) throw new Error(isExistedUser.EM);
      const idLiked = await Liker.findOne({
        where: {
          userId,
          ratingId,
        },
      });
      if (idLiked) throw new Error("Bạn đã like comment này trước kia");
      const like = await Liker.create(
        {
          ratingId,
          userId,
        },
        {
          transaction: t,
        }
      );
      const isIncreaa = await Rating.increment("totalLike", {
        by: 1, // Số lượng muốn tăng (ví dụ: 1)
        where: { id: ratingId }, // Điều kiện xác định bản ghi cụ thể
        transaction: t,
      });
      // if (!isIncreaa[1]) throw new Error("Update not success");
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "OKE",
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
  public getInforRating = async (ratingId: number) => {
    try {
      const isExistedRating = await Rating.findByPk(ratingId, {
        raw: true,
      });
      if (!isExistedRating) throw new Error("Rating not existed");
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: isExistedRating.totalLike,
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
  public getAllCommentForShop = async (shopId: number) => {
    try {
      const existedShop = await Shop.findByPk(shopId, {
        include: [
          {
            model: Products,
            include: [
              {
                model: Rating,
                as: "comment_Rating",
                include: [
                  {
                    model: Comment,
                    as: "comment_rating",
                  },
                  {
                    model: infor_Product,
                    as: "infoPro_Comment",
                  },
                ],
              },
            ],
          },
        ],
      });
      if (!existedShop) throw new Error("Shop not existed");

      const listProductOfShopWithRaw: Shop = existedShop.toJSON();
      const arrComment: any[] = [];

      const listComment = listProductOfShopWithRaw.shop_Sellers.map((item) => {
        if (item.comment_Rating.length > 0)
          item.comment_Rating.map((c) => {
            const temp = {
              productId: item.id,
              ProductName: c.infoPro_Comment
                ? `${item.nameVi} - ${c.infoPro_Comment.k} ${c.infoPro_Comment.v}`
                : item.nameVi,
              username:
                c.comment_rating[0].firstName +
                " " +
                c.comment_rating[0].lastName,
              content: c.comment_rating[0].content,
              commentId: c.comment_rating[0].id,
              image: c.comment_rating[0].image,
              date: c.comment_rating[0].createdAt,
              rating: Number(c.star.slice(-1)),
              userId: c.comment_rating[0].userId,
            };
            arrComment.push(temp);
          });
      });

      const getNewImageUser = await Promise.all(
        arrComment.map(async (item) => {
          const userId = item.userId;
          const getImageUser = await serviceUser.getUserById(userId);
          if (getImageUser.EC == 1) throw new Error(getImageUser.EM);
          return {
            ...item,
            image: getImageUser?.data.image,
          };
        })
      );
      return {
        ST: 200,
        EM: "OK",
        EC: 0,
        data: getNewImageUser,
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
  public replyComment = async (commentData: any) => {
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
      const { userId, commentId } = commentData;
      console.log(userId, commentId);
      const isExistedUser = await serviceUser.getUserById(userId);
      if (isExistedUser.EC === 1) throw new Error("User not existed");
      const existedComment = await Comment.findByPk(commentId);
      if (!existedComment) throw new Error("Comment Not Existed");
      const createReplyForComment = await Reply.create(
        {
          ...commentData,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return {
        ST: 200,
        EM: "CREATE REPLY SUCCESSFULLY",
        EC: 0,
        data: createReplyForComment,
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
  public getAllCommentOfShop = async (userId: number, commentId: number) => {
    try {
      const isExistedUser = await serviceUser.getAllUsers(userId);
      if (isExistedUser.EC == 1) throw new Error(isExistedUser.EM);
      const isExistedComment = await Comment.findByPk(commentId);
      if (!isExistedComment) throw new Error("Comment not existed");
      const allComment = await Reply.findAndCountAll({
        attributes: { exclude: ["firstName", "lastName", "parentId"] },
        where: {
          userId,
          commentId,
        },
      });
      return {
        ST: 200,
        EM: "OK",
        EC: 0,
        data: allComment.rows,
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
  public updateReply = async (data: any) => {
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
      const { replyId, userId, commentId, content } = data;
      if (!replyId || !userId || !commentId || !content)
        throw new Error("MISSING INPUT");
      const isExistedUser = await serviceUser.getUserById(userId);
      if (isExistedUser.EC == 1) throw new Error(isExistedUser.EM);
      const isExistedReply = await Reply.findByPk(replyId);
      if (!isExistedReply) throw new Error("Reply not existed");
      const isExistedComment = await Comment.findByPk(commentId);
      if (!isExistedComment) throw new Error("commentId not existed");
      await Reply.update(
        {
          content,
        },
        {
          where: {
            id: replyId,
            commentId,
            userId,
          },
          transaction: t,
        }
      );
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "UPDATE COMMENT SUCCESSFULLY",
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

  public deleteComment = async (data: any) => {
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
      const { commentId, userId } = data;
      if (!userId || !commentId) throw new Error("MISSING INPUT");
      const isExistedUser = await serviceUser.getUserById(userId);
      if (isExistedUser.EC == 1) throw new Error(isExistedUser.EM);
      const isExistedComment = await Comment.findByPk(commentId);
      if (!isExistedComment) throw new Error("commentId not existed");
      const isDeleteComment = await Comment.destroy({
        where: {
          id: commentId,
        },
        transaction: t,
      });
      if (isDeleteComment > 0) {
        await Reply.destroy({
          where: {
            commentId,
          },
          transaction: t,
        });
      }
      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "DELETE COMMENT SUCCESSFULLY",
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

  public deleteReply = async (data: any) => {
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
      const { commentId, userId, replyId } = data;
      if (!userId || !commentId || !replyId) throw new Error("MISSING INPUT");
      const isExistedUser = await serviceUser.getUserById(userId);
      if (isExistedUser.EC == 1) throw new Error(isExistedUser.EM);
      const isExistedComment = await Comment.findByPk(commentId);
      const isExistedReply = await Reply.findByPk(replyId);
      if (!isExistedReply) throw new Error("Reply not existed");
      if (!isExistedComment) throw new Error("commentId not existed");

      await Reply.destroy({
        where: {
          commentId,
          id: replyId,
          userId,
        },
        transaction: t,
      });

      await t.commit();
      return {
        ST: 200,
        EC: 0,
        EM: "DELETE Reply SUCCESSFULLY",
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
  public statisticalFigue = async ({
    shopId,
    type,
    rangeTime,
  }: {
    shopId: number;
    type: string;
    rangeTime?: { startDate: string; endDate: String };
  }) => {
    try {
      const isExistedShop = await Shop.findByPk(shopId);
      if (!isExistedShop) throw new Error("Shop not existed");
      let currentTotalRevenue = 0,
        preTotalRevenue = 0,
        currentNumberProduct = 0,
        PreNumberProduct = 0,
        currentNumberOrder = 0,
        PreNumberOrder = 0,
        processingOrder = 0,
        completeOrder = 0,
        transportOrder = 0,
        cancelOrder = 0,
        pendingOrder = 0;
      let rangeDay: any;
      let rangePreDay: any;
      if (type == "today") {
        const date = new Date();
        rangeDay = getDate(date);
        date.setDate(date.getDate() - 1);
        rangePreDay = getDate(date);
      } else if (type == "yesterday") {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        rangeDay = getDate(date);
        date.setDate(date.getDate() - 1);
        rangePreDay = getDate(date);
      } else if (type == "this_week") {
        rangePreDay = {
          startOfDay: moment()
            .subtract(1, "week") // Lùi lại một tuần
            .tz("Asia/Bangkok")
            .startOf("week")
            .format("YYYY-MM-DD 00:00:00+07:00"),

          endOfDay: moment()
            .subtract(1, "week") // Lùi lại một tuần
            .tz("Asia/Bangkok")
            .endOf("week")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
        rangeDay = {
          startOfDay: moment()
            .tz("Asia/Bangkok")
            .startOf("week")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .tz("Asia/Bangkok")
            .endOf("week")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
      } else if (type == "this_month") {
        rangeDay = {
          startOfDay: moment()
            .startOf("month")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment().endOf("month").format("YYYY-MM-DD 23:59:59+07:00"),
        };
        rangePreDay = {
          startOfDay: moment()
            .subtract(1, "month")
            .startOf("month")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(1, "month")
            .endOf("month")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
      } else if (type == "this_quarter") {
        rangeDay = {
          startOfDay: moment()
            .startOf("quarter")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .endOf("quarter")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
        rangePreDay = {
          startOfDay: moment()
            .subtract(1, "quarter")
            .startOf("quarter")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(1, "quarter")
            .endOf("quarter")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
      } else if (type == "this_year") {
        rangeDay = {
          startOfDay: moment()
            .startOf("year")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment().endOf("year").format("YYYY-MM-DD 23:59:59+07:00"),
        };
        rangePreDay = {
          startOfDay: moment()
            .subtract(1, "year")
            .startOf("year")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(1, "year")
            .endOf("year")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
      } else if (type == "last_week") {
        rangeDay = {
          startOfDay: moment()
            .subtract(1, "week")
            .startOf("week")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(1, "week")
            .endOf("week")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
        rangePreDay = {
          startOfDay: moment()
            .subtract(2, "week")
            .startOf("week")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(2, "week")
            .endOf("week")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
      } else if (type == "last_month") {
        rangeDay = {
          startOfDay: moment()
            .subtract(1, "month")
            .startOf("month")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(1, "month")
            .endOf("month")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
        rangePreDay = {
          startOfDay: moment()
            .subtract(2, "month")
            .startOf("month")
            .format("YYYY-MM-DD 00:00:00+07:00"),
          endOfDay: moment()
            .subtract(2, "month")
            .endOf("month")
            .format("YYYY-MM-DD 23:59:59+07:00"),
        };
      }

      currentTotalRevenue =
        (await Order_Items.sum("price", {
          where: {
            shopId,
            status: "SOI4",
            createdAt: {
              [Op.between]: [rangeDay.startOfDay, rangeDay.endOfDay],
            },
          },
        })) || 0;

      preTotalRevenue =
        (await Order_Items.sum("price", {
          where: {
            shopId,
            status: "SOI4",
            createdAt: {
              [Op.between]: [rangePreDay.startOfDay, rangePreDay.endOfDay],
            },
          },
        })) || 0;

      // count quantiy of product of shop
      const countProductCurrentDay = await Seller.findAll({
        attributes: [
          "ShopId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["ShopId"],
        where: {
          ShopId: shopId,
          createdAt: {
            [Op.between]: [rangeDay.startOfDay, rangeDay.endOfDay],
          },
        },
      });

      currentNumberProduct =
        countProductCurrentDay.length > 0
          ? Number(countProductCurrentDay[0].toJSON().count)
          : 0;

      const countProductPreDay = await Seller.findAll({
        attributes: [
          "ShopId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["ShopId"],
        where: {
          ShopId: shopId,
          createdAt: {
            [Op.between]: [rangePreDay.startOfDay, rangePreDay.endOfDay],
          },
        },
      });
      PreNumberProduct =
        countProductPreDay.length > 0
          ? Number(countProductPreDay[0].toJSON().count)
          : 0;

      // count order

      currentNumberOrder =
        (await Order_Items.count({
          where: {
            shopId,
            createdAt: {
              [Op.between]: [rangeDay.startOfDay, rangeDay.endOfDay],
            },
          },
        })) || 0;
      PreNumberOrder =
        (await Order_Items.count({
          where: {
            shopId,
            createdAt: {
              [Op.between]: [rangePreDay.startOfDay, rangePreDay.endOfDay],
            },
          },
        })) || 0;

      const orders = await Order_Items.findAll({
        where: {
          shopId,
          createdAt: {
            [Op.between]: [rangeDay.startOfDay, rangeDay.endOfDay],
          },
        },
      });
      const newOrder = orders.map((item) => item.toJSON());
      pendingOrder =
        newOrder.filter((item) => item.status == "SOI1")?.length || 0;
      processingOrder =
        newOrder.filter((item) => item.status == "SOI2")?.length || 0;
      transportOrder =
        newOrder.filter((item) => item.status == "SOI3")?.length || 0;
      completeOrder =
        newOrder.filter((item) => item.status == "SOI4")?.length || 0;
      cancelOrder =
        newOrder.filter((item) => item.status == "SOI5")?.length || 0;

      //rating
      const getCurRating = await Shop.findOne({
        include: [
          {
            model: Products,
            include: [
              {
                model: Rating,
                as: "comment_Rating",
                where: {
                  createdAt: {
                    [Op.between]: [rangeDay.startOfDay, rangeDay.endOfDay],
                  },
                },
              },
            ],
          },
        ],
        where: {
          id: shopId,
        },
      });

      const getPreRating = await Shop.findOne({
        include: [
          {
            model: Products,
            include: [
              {
                model: Rating,
                as: "comment_Rating",
                where: {
                  createdAt: {
                    [Op.between]: [
                      rangePreDay.startOfDay,
                      rangePreDay.endOfDay,
                    ],
                  },
                },
              },
            ],
          },
        ],
        where: {
          id: shopId,
        },
      });

      const getRatingWithRaw = getCurRating?.toJSON();
      const getPreRatingWithRaw = getPreRating?.toJSON();
      let totaCurlStar = 0,
        totalCurRating = 0;
      if (getCurRating) {
        console.log("dfslahfdkasjh");
        getRatingWithRaw.shop_Sellers.map((item: any) => {
          totaCurlStar += item.comment_Rating.length;
          if (item.comment_Rating.length > 0) {
            item.comment_Rating.map((i: any) => {
              totalCurRating += Number(i.star.slice(-1));
            });
          }
        });
      }

      console.log(totaCurlStar, totalCurRating);
      let totaPrelStar = 0,
        totalPreRating = 0;
      if (getPreRating)
        getPreRatingWithRaw.shop_Sellers.map((item: any) => {
          totaPrelStar += item.comment_Rating.length;
          if (item.comment_Rating.length > 0) {
            item.comment_Rating.map((i: any) => {
              totalPreRating += Number(i.star.slice(-1));
            });
          }
        });

      const starPre = totaPrelStar > 0 ? totalPreRating / totaPrelStar : 0;
      const starCur = totaCurlStar > 0 ? totalCurRating / totaCurlStar : 0;
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: {
          DT: [
            {
              type: "Doanh thu",
              pre: preTotalRevenue,
              cur: formatCurrency(currentTotalRevenue),
              change: calChangePercent(
                currentTotalRevenue,
                preTotalRevenue,
                type
              ),
              iconColor: "text-green-500",
              valueColor: "text-green-600",
              changeColor: "text-green-600",
            },
            {
              type: "Sản phẩm",
              pre: PreNumberProduct,
              cur: currentNumberProduct,
              change: calChangePercent(
                currentNumberProduct,
                PreNumberProduct,
                type
              ),
              iconColor: "text-yellow-500",
              valueColor: "text-yellow-600",
              changeColor: "text-yellow-600",
            },
            {
              type: "Đơn hàng",
              cur: currentNumberOrder,
              pre: PreNumberOrder,
              change: calChangePercent(
                currentNumberOrder,
                PreNumberOrder,
                type
              ),
              detailOrder: {
                processingOrder,
                completeOrder,
                transportOrder,
                cancelOrder,
                pendingOrder,
              },
              iconColor: "text-blue-500",
              valueColor: "text-blue-600",
              changeColor: "text-blue-600",
            },
            {
              type: "Đánh giá",
              pre: starPre.toFixed(2),
              cur: starCur.toFixed(2),
              change: calChangePercent(starCur, starPre, type),
              iconColor: "text-yellow-600",
              valueColor: "text-yellow-600",
              changeColor: "text-yellow-600",
            },
          ],
          date: {
            type: "date",
            cur: {
              start: moment(rangeDay.startOfDay).format("DD-MM-YYYY"),
              end: moment(rangeDay.endOfDay).format("DD-MM-YYYY"),
            },
            pre: {
              start: moment(rangePreDay.startOfDay).format("DD-MM-YYYY"),
              end: moment(rangePreDay.endOfDay).format("DD-MM-YYYY"),
            },
          },
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
  public statisOtherFigue = async (shopId: number) => {
    const sequelize = await db.sequelize;
    if (!sequelize) {
      return {
        ST: 500,
        EC: 1,
        EM: `Sequelize isn't ready`,
        data: [],
      };
    }
    try {
      const isExistedShop = Shop.findByPk(shopId);
      if (!isExistedShop) throw new Error("Shop not existed");
      const monthsVN = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ];
      const year = new Date().getFullYear();
      const monthlyRevenue = await Order_Items.findAll({
        attributes: [
          [fn("EXTRACT", literal('MONTH FROM "createdAt"')), "month"], // Trích tháng từ createdAt
          [fn("SUM", col("price")), "total_revenue"],
          [fn("COUNT", col("id")), "total_Order"], // Tính tổng `price` cho mỗi tháng
        ],
        where: {
          createdAt: {
            [Op.and]: [
              { [Op.gte]: `${+year}-01-01` },
              { [Op.lt]: `${+year + 1}-01-01` },
            ],
          },
          shopId: shopId,
          status: "SOI4",
        },
        group: [fn("EXTRACT", literal('MONTH FROM "createdAt"'))], // Nhóm theo tháng
        order: [fn("EXTRACT", literal('MONTH FROM "createdAt"'))], // Sắp xếp theo tháng
      });
      const listReOr = monthlyRevenue.map((record) =>
        record.get({ plain: true })
      );

      const newList = monthsVN.map((item) => {
        const month = Number(item.split(" ")[1]);
        const data = listReOr.find((l) => +l.month == month);
        if (data)
          return {
            ...data,
            month: item,
            total_revenue: +data.total_revenue,
            total_Order: +data.total_Order,
          };
        return {
          month: item,
          total_revenue: 0,
          total_Order: 0,
        };
      });

      // category
      const queries = await Order_Items.findAll({
        attributes: [
          "productId",
          [Sequelize.fn("COUNT", col("Order_Items.id")), "total_products"],
        ],
        include: [
          {
            model: Products,
            as: "pro_Order",
            attributes: ["id"],
            include: [
              {
                model: Category,
                as: "pro_cate",
                attributes: ["id", "nameVi"],
              },
            ],
          },
        ],
        where: {
          shopId,
          status: "SOI4",
        },
        group: [
          "Order_Items.productId",
          "pro_Order.id",
          "pro_Order->pro_cate.id",
        ],
      });
      const queryWithRaw = queries.map((item) => item.toJSON());
      const newQuety = await Promise.all(
        queryWithRaw.map(async (item) => {
          const id = item?.pro_Order?.pro_cate?.id;
          const parentCate = await getParentCate(id);
          return {
            ...item,
            parentCate: parentCate.data,
          };
        })
      );
      const result = _(
        newQuety.map((item) => {
          return {
            total_products: Number(item?.total_products),
            category: item?.parentCate?.nameVi,
            id: item?.parentCate.id,
          };
        })
      )
        .groupBy("id")
        .map((items, id) => ({
          id: parseInt(id),
          category: items[0].category,
          total_products: _.sumBy(items, "total_products"),
        }))
        .value();

      // product per month
      const productMonth: any = await sequelize.query(
        `
       WITH RankedProducts AS (
    SELECT 
        EXTRACT(MONTH FROM "Order_Items"."createdAt") AS month,
        "Order_Items"."productId",
        COUNT("Order_Items"."id") AS total_product,
        "Products"."nameVi",  
        ROW_NUMBER() OVER (PARTITION BY EXTRACT(MONTH FROM "Order_Items"."createdAt") ORDER BY COUNT("Order_Items"."id") DESC) AS row_num
    FROM "Order_Items"
    JOIN "Products" ON "Products".id = "Order_Items"."productId"  
    WHERE "Order_Items"."createdAt" >= :startDate
      AND "Order_Items"."createdAt" < :endDate
      AND "Order_Items"."shopId" = :shopId
      AND "Order_Items"."status" = 'SOI4'
    GROUP BY EXTRACT(MONTH FROM "Order_Items"."createdAt"), "Order_Items"."productId", "Products"."nameVi" 
)
SELECT * 
FROM RankedProducts 
WHERE row_num <= 5
ORDER BY month ASC, row_num ASC;
      `,
        {
          replacements: {
            startDate: `${year}-01-01`,
            endDate: `${year + 1}-01-01`,
            shopId: shopId,
          },
          // type: sequelize.QueryTypes.SELECT,
        }
      );

      const list: any = [];
      productMonth[1]?.rows.map((item: any) => {
        const temp: any = {
          name: item.nameVi,
          sellMonth: [],
        };
        monthsVN.map((m) => {
          const month = Number(m.split(" ")[1]);
          if (+item.month == month) {
            temp.sellMonth.push(+item.total_product);
          } else {
            temp.sellMonth.push(0);
          }
        });
        list.push(temp);
      });

      const status = await Order_Items.findAll({
        attributes: [
          "status",
          [Sequelize.fn("COUNT", col("id")), "total_products"],
        ],

        where: {
          shopId,
        },
        group: ["Order_Items.status"],
      });
      const statusWithRaw = status.map((item) => item.toJSON());
      const [statusOrder] = await Promise.all([
        instance.get(`get-allcode?type=STUTUS_ORDER_ITEM`),
      ]);
      let totalOrder = statusWithRaw.reduce((sum, item) => {
        const totalProducts = Number(item.total_products);
        // Kiểm tra xem totalProducts có phải là số hợp lệ
        return sum + (isNaN(totalProducts) ? 0 : totalProducts);
      }, 0);
      const newListStatus = statusOrder.data.map((s: any) => {
        const findStatus = statusWithRaw.find(
          (item) => item.status == s.keyMap
        );
        if (findStatus) {
          return {
            name: s.valueVi,
            total: +findStatus.total_products,
          };
        }
        return {
          name: s.valueVi,
          total: 0,
        };
      });
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: {
          revenueAndOrder: newList,
          category: result,
          sellMonth: {
            listMonth: monthsVN,
            listProduct: list,
          },
          newListStatus: newListStatus.map((item: any) => {
            return {
              ...item,
              percent: totalOrder > 0 ? (item.total / totalOrder) * 100 : 0,
            };
          }),
        },
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
}
export default new CommentService();

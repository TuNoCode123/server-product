import { Router } from "express";
import { upload, uploadToCloudinary } from "../middleware/cloudinary";
import commentCotroller from "../controllers/comment.cotroller";
const routerComment = Router();
routerComment.post(
  "/create-rating",
  upload.array("images", 5),
  uploadToCloudinary,
  commentCotroller.createRating
);
routerComment.get("/get-all-comment", commentCotroller.getAllComment);
routerComment.delete("/delete-comment", commentCotroller.deleteRating);
routerComment.get("/get-all-star", commentCotroller.getAllStarOfProduct);
routerComment.get("/like-comment", commentCotroller.likeComment);
routerComment.get("/get-infor-rating", commentCotroller.getInforRating);
routerComment.get(
  "/get-all-comment-for-shop",
  commentCotroller.getAllCommentForShop
);
routerComment.post("/reply-comment", commentCotroller.replyComment);
routerComment.get(
  "/get-all-comment-of-shop",
  commentCotroller.getAllCommentOfShop
);
routerComment.put("/update-reply", commentCotroller.updateReply);
routerComment.delete("/delete-comment", commentCotroller.deleteComment);
routerComment.delete("/delete-reply", commentCotroller.deleteReply);
routerComment.post(
  "/statistical-figue-for-shop",
  commentCotroller.statisticalFigueForShop
);
routerComment.get(
  "/statistical-figue-other-for-shop",
  commentCotroller.statisOther
);

export default routerComment;

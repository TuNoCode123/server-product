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

export default routerComment;

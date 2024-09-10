import multer, { Multer } from "multer";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { NextFunction, Request, Response } from "express";
import { checkVarErr } from "../utils/error";
import { notFound } from "../helpers/err";

interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer;
}
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage: storage });
export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files: CloudinaryFile[] = req.files as CloudinaryFile[];
    const { email, passWord, firstName, lastName, gender, ...restObject } =
      req.body;
    const isErrorExisted = checkVarErr({
      email,
      passWord,
      firstName,
      lastName,
      gender,
    });
    if (isErrorExisted.EC == 1) {
      return notFound(isErrorExisted.EM, res);
    }
    if (!files || files.length === 0) {
      return next();
    }
    const cloudinaryUrls: string[] = [];
    for (const file of files) {
      // const resizedBuffer: Buffer = await sharp(file.buffer)
      //   .resize({ width: 800, height: 800 })
      //   .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "uploads",
        } as any,
        (
          err: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (err) {
            console.error("Cloudinary upload error:", err);
            return next(err);
          }
          if (!result) {
            console.error("Cloudinary upload error: Result is undefined");
            return next(new Error("Cloudinary upload result is undefined"));
          }
          cloudinaryUrls.push(result.secure_url);
          if (cloudinaryUrls.length === files.length) {
            req.body.cloudinaryUrls = cloudinaryUrls;
            next();
          }
        }
      );
      uploadStream.end(file.buffer);
    }
  } catch (error) {
    console.error("Error in uploadToCloudinary middleware:", error);
    next(error);
  }
};

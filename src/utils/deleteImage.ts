import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
export const deteteImageFromClound = async (publicId: string) => {
  try {
    if (!publicId) return;
    const originPublicId = publicId.split("/");
    await cloudinary.uploader.destroy(
      originPublicId[1],
      function (error, result) {
        console.log("delete image success");
      }
    );
    return {
      EC: 0,
    };
  } catch (error) {
    console.log(error);
    return {
      EC: 1,
    };
  }
};

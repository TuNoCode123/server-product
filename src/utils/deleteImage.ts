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
    console.log("cloud-image", error);
    return {
      EC: 1,
    };
  }
};
export function getPublicId(url: any) {
  // Sử dụng biểu thức chính quy để tìm public_id
  const regex = /\/uploads\/(.+?)\.webp/;
  const match = url.match(regex);

  // Kiểm tra nếu có kết quả match
  if (match && match[1]) {
    return match[1]; // Trả về public_id
  } else {
    return null; // Không tìm thấy public_id
  }
}
export const deteteImageFromCloundRaw = async (publicId: string) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId, function (error, result) {
      console.log("delete image success");
    });
    return {
      EC: 0,
    };
  } catch (error) {
    console.log("cloud-image", error);
    return {
      EC: 1,
    };
  }
};

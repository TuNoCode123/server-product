import Category from "../models/model.category";

type Result = {
  EC: number;
  EM: string;
  data?: any; // `data` là tùy chọn vì có thể không có khi xảy ra lỗi
};

export const getParentCate = async (id: number): Promise<Result> => {
  try {
    const isExistedCate = await Category.findByPk(id);
    if (!isExistedCate) throw new Error("Category not existed");

    const raw = isExistedCate.toJSON();

    if (raw.parentId != null) {
      return await getParentCate(raw.parentId);
    }

    return {
      EC: 0,
      EM: "OK",
      data: raw,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        EC: 1,
        EM: error.message,
      };
    }
    return {
      EC: 1,
      EM: "ERROR at getParentCate",
    };
  }
};

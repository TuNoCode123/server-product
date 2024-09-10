import { Iuser } from "../interfaces/interface.user";

export const checkVarErr = (infor: Iuser) => {
  const newInfor = Object.keys(
    Object.fromEntries(
      Object.entries(infor).filter((item) => item[1] == undefined)
    )
  );
  let mess = "";
  for (let i = 0; i < newInfor.length; i++) {
    mess += `${newInfor[i]} `;
  }
  if (newInfor.length > 0) {
    return {
      EC: 1,
      EM: `missing input ${mess} `,
    };
  }
  return {
    EC: 0,
  };
};

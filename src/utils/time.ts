import moment from "moment-timezone";
export const getDate = (dateInput: Date) => {
  const formatDate = dateInput.toISOString().split("T")[0];
  const date = moment.tz(formatDate, "Asia/Bangkok");

  // Thiết lập đầu ngày và cuối ngày với múi giờ +07:00
  const startOfDay = date.startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
  const endOfDay = date.endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

  return {
    startOfDay,
    endOfDay,
  };
};
export const calChangePercent = (
  currentTotalRevenue: number,
  preTotalRevenue: number,
  type: string
) => {
  let percentageChange;

  if (preTotalRevenue === 0) {
    if (currentTotalRevenue === 0) {
      percentageChange = 0; // Không có sự thay đổi nếu cả hai đều bằng 0
    } else {
      percentageChange = 100; // Có sự tăng trưởng từ 0, ví dụ từ 0 đến một giá trị dương
    }
  } else {
    percentageChange =
      ((currentTotalRevenue - preTotalRevenue) / preTotalRevenue) * 100;
  }
  //   ("+19% from last month");
  return type.includes("_")
    ? percentageChange >= 0
      ? `+${percentageChange.toFixed(2)}% from last ${type.split("_")[1]}`
      : `${percentageChange.toFixed(2)}% from last ${type.split("_")[1]}`
    : percentageChange >= 0
    ? `+${percentageChange.toFixed(2)}% from the previous day`
    : `${percentageChange.toFixed(2)}% from the previous day`;
};

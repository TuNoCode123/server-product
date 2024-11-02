export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  // Format thành ngày/tháng/năm
  const formattedDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return formattedDate;
};

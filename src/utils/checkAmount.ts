import { AxiosRequestConfig } from "axios";

export function validateOrderAmounts(config: AxiosRequestConfig): boolean {
  // Lấy purchase_units từ config
  const purchaseUnits = config.data?.purchase_units;
  if (!purchaseUnits || purchaseUnits.length === 0) {
    console.error("No purchase units found.");
    return false;
  }

  for (const unit of purchaseUnits) {
    const amount = unit.amount;
    const breakdown = amount.breakdown;

    // Tính tổng của breakdown
    // const breakdownTotal = Object.values(breakdown).reduce(
    //   (total: any, item: any) => {
    //     return total + parseFloat(item.value); // Chuyển đổi string thành float
    //   },
    //   0
    // );
    const temp: any = Object.values(breakdown);
    console.log(temp);
    const total =
      parseFloat(temp[0].value) +
      parseFloat(temp[1].value) -
      parseFloat(temp[2].value) -
      parseFloat(temp[3].value);
    //   temp[4].value;

    // Lấy giá trị tổng của amount
    const totalAmount = parseFloat(amount.value);
    console.log("totalAmount", totalAmount);
    console.log("total", total);

    // Kiểm tra xem tổng breakdown có bằng tổng amount không
    if (totalAmount !== total) {
      console.error(
        `Total amount ${totalAmount} does not equal breakdown total ${total}.`
      );
      return false;
    }
  }

  return true; // Tất cả kiểm tra thành công
}

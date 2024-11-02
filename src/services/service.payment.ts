import axios, { AxiosRequestConfig } from "axios";
import { Icart, Iorder, ItotalCart } from "../interfaces/interface.order";
import orderService from "./service.order";
import Payment from "../models/model.payment";
import { validateOrderAmounts } from "../utils/checkAmount";
// import { linkPayment } from "../utils/actions/actions";
export const linkPayment = {
  complete: "complete-order",
  cancel: "cancel-order",
};

require("dotenv").config();

const createAccessToken = async () => {
  const config: AxiosRequestConfig = {
    url: process.env.BASEURLPAYPAL + "v1/oauth2/token",
    method: "post",
    auth: {
      username: process.env.CLIENT_ID ? process.env.CLIENT_ID : "test",
      password: process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : "test",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: "grant_type=client_credentials",
  };
  const response = await axios(config);
  return response.data.access_token;
};
export const createOrder = async (
  totalCart: ItotalCart,
  listProduct: Icart[]
) => {
  const access_token = await createAccessToken();

  try {
    const customOrder: Iorder = {
      userId: totalCart.userId,
      price: totalCart.totalPrices,
      status: "",
      note: "",
    };
    const res: any = await orderService.createOrder(
      customOrder,
      listProduct,
      totalCart
    );
    if (res.EC == 0) {
      const config: AxiosRequestConfig = {
        url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        data: {
          intent: "CAPTURE",
          purchase_units: [
            {
              items: listProduct.map((item) => {
                return {
                  name: item.product.nameVi,
                  quantity: item.quantity,
                  unit_amount: {
                    currency_code: "USD",
                    value: (item.product.totalprices / 25000).toFixed(2), // Làm tròn đến 2 chữ số thập phân
                  },
                };
              }),
              amount: {
                currency_code: "USD",
                value: (totalCart.totalPrices / 25000).toFixed(2), // Làm tròn đến 2 chữ số thập phân
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: (
                      (totalCart.tempCalculate - totalCart.totalDiscount) /
                      25000
                    ).toFixed(2),
                  },
                  shipping: {
                    currency_code: "USD",
                    value: (totalCart.transportFee / 25000).toFixed(2), // Phí vận chuyển
                  },
                  discount: {
                    currency_code: "USD",
                    value: (isNaN(totalCart.discount)
                      ? 0
                      : totalCart.discount / 25000
                    ).toFixed(2), // Giảm giá
                  },

                  shipping_discount: {
                    currency_code: "USD",
                    value: (isNaN(totalCart.transportDiscount)
                      ? 0
                      : totalCart.transportDiscount / 25000
                    ).toFixed(2), // Giảm giá trên phí vận chuyển
                  },
                },
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                user_action: "PAY_NOW",
                shipping_preference: "NO_SHIPPING",
                return_url: `${process.env.CLIENT_BASE_URL}${linkPayment.complete}?orderId=${res?.data?.orderId}`,
                cancel_url: `${process.env.CLIENT_BASE_URL}?orderId=${res?.data?.orderId}`,
              },
            },
          },
        },
      };
      // const invalid = validateOrderAmounts(config);
      // if (!invalid) {
      //   return {
      //     ST: 400,
      //     EC: 1,
      //     EM: "AMOUNT NOT MATCH",
      //   };
      // }
      const response = await axios(config);
      await Payment.update(
        {
          status: "SP2",
        },
        {
          where: {
            orderId: res?.data?.orderId,
          },
        }
      );
      return {
        ST: 200,
        EC: 0,
        EM: "OK",
        data: {
          url: response.data.links.find(
            (item: any) => item.rel == "payer-action"
          ).href,
          id: response.data.id,
        },
      };
    }
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating order:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
export const checkStatusOrder = async (orderId: any) => {
  try {
    const access_token = await createAccessToken();
    const config: AxiosRequestConfig = {
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };
    const response = await axios(config);
    const orderStatus = response.data.status;
    if (orderStatus === "COMPLETED" || orderStatus === "APPROVED") {
      return {
        EC: 0,
        EM: orderStatus,
      };
    } else if (orderStatus === "FAILED" || orderStatus === "DENIED") {
      return {
        EC: 1,
        EM: `Transaction is ${orderStatus}`,
      };
    } else {
      return {
        EC: 1,
        EM: `Payment status: ${orderStatus}`,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EC: 999,
      EM: "Error fetching order details",
    };
  }
};
export const capturePayment = async (token: any) => {
  try {
    const access_token = await createAccessToken();
    const config: AxiosRequestConfig = {
      url: process.env.BASEURLPAYPAL + `v2/checkout/orders/${token}/capture`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };
    const response = await axios(config);
    return {
      EC: 0,
      EM: "CAPTURE PAYMENT SUCCESS",
    };
  } catch (error) {
    return {
      EC: 1,
      EM: "CAPTURE PAYMENT ERROR",
    };
  }
};

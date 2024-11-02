export interface Iorder {
  id?: number;
  userId: number;
  price: number;
  status: string;
  note: string;
}
export interface ItotalCart {
  tempCalculate: number;
  totalDiscount: number;
  totalPrices: number;
  quantity: number;
  totalDiscountOnCoupon: number;
  discount: number;
  transportDiscount: number;
  transportFee: number;
  userId: number;
  discountCode: number;
  transportCode: number;
}
export interface IchildProduct {
  id: number;
  image: string;
  k: string;
  productId: number;
  v: string;
}
export interface Icart {
  idShop: any;
  product: {
    id: any;
    nameVi: string;
    image: string;
    price: number;
    totalprices: number;
  };
  quantity: number;
  totalPrices: number;
  childProduct?: IchildProduct;
  selected?: boolean;
}
export interface Imailer {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface Iproduct {
  id: any;
  nameEn: string;
  nameVi: string;
  description: string;
  price: number;
  discount: number;
  totalPrices: number;
  uuid?: string;
}
export interface IattributeProduct {
  k: any;
  v: any;
  productId?: number;
  id?: number;
}

export interface IdescriptionProduct {
  html: string;
  text: string;
  productId: number;
}

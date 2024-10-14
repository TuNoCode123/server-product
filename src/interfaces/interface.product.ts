import { Optional } from "sequelize";

export interface Iproduct {
  id: any;
  nameEn: string;
  nameVi: string;
  description: string;
  price: number;
  discount: number;
  totalPrices: number;
  uuid?: string;
  quantity?: number;
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

export interface IchildProduct {
  k: any;
  v: any;
  productId?: number;
  id?: number;
  image: any;
  quantity?: number;
}

export interface Ishop {
  userId?: number;
  id?: number;
  image: any;
  backlog: any;
  name: any;
  description: any;
}
export type IchildProductCreationAttributes = Optional<IchildProduct, "id">;

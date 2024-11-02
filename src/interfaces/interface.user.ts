export interface Iuser {
  id?: number;
  roleId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  passWord?: string;
  address?: string;
  gender?: string;
  socialLogin?: string;
  image?: string;
  uuid?: string;
}
export interface Icategory {
  id?: string;
  nameVi: string;
  nameEn: string;
  parentId: string;
  image: string;
}
export interface IimageProduct {
  image: string;
  publicId: string;
  productId: number;
}
export interface Icounpon {
  dateTo: any;
  description: string;
  discount: number;
  limit: number;
  status: string;
  type: string;
  condition: number;
  id: number;
  code_type: any;
  code_status: any;
}

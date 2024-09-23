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

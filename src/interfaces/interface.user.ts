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
export interface Iratinng {
  id?: number;
  productId: number;
  productChildId: number;
  orderId: number;
  star: number;
  comment: string;
  parentId?: number;
  rating_comment?: Icomment[];
  userId: number;
  removeImageExisted: any[];
}
export interface Icomment {
  id: number;
  ratingId: number;
  content: string;
  userId: number;
  image_comment: IimageComment[];
}
export interface IimageComment {
  id: number;
  commentId: number;
  image: string;
  publicId: number;
}
export interface Iratings {
  id: number;
  productId: number;
  productChildId: number;
  orderId: number;
  star: string;
  status: null;
  content: null;
  totalLike: number;
  totalResponse: number;
  createdAt: string;
  updatedAt: string;
  comment_rating: Icomment[];
}

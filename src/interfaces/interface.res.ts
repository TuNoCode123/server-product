export interface Iresponse<T> {
  EC: number;
  EM: string;
  data: T;
  status?: number;
}
export interface Ires {
  EC: number;
  EM: string;
}

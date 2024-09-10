export interface Iresponse<T> {
  EC: number;
  EM: string;
  data: T;
  status?: number;
}

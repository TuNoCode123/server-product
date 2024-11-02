import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Products from "./model.product";
import Reserve from "./model.reserve";
import Inventory from "./model.inventory";
import Order from "./model.order";
import Coupon from "./model.coupon";

@Table({
  tableName: Coupon_Order.TABLE_NAME,
})
class Coupon_Order extends Model {
  public static TABLE_NAME = "Coupon_Order" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_ORDER_ID = "OrderId" as string;
  public static COLUMN_COUPON_ID = "couponId" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Coupon_Order.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    field: Coupon_Order.COLUMN_ORDER_ID,
  })
  orderId!: string;

  @ForeignKey(() => Coupon)
  @Column({
    type: DataType.INTEGER,
    field: Coupon_Order.COLUMN_COUPON_ID,
  })
  couponId!: string;
}
export default Coupon_Order;

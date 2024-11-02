import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import Order_Items from "./model.order_Items";
import Payment from "./model.payment";
import Coupon from "./model.coupon";
import Coupon_Order from "./model.coupon_Order";
import Rating from "./model.rating";

@Table({
  tableName: Order.TABLE_NAME,
})
class Order extends Model {
  public static TABLE_NAME = "Order" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  public static COLUMN_STATUS = "status" as string;
  public static COLUMN_PRICE = "price" as string;
  public static COLUMN_NOTE = "note" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Order.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Order.COLUMN_USER_ID,
  })
  userId!: string;

  @Column({
    type: DataType.STRING,
    field: Order.COLUMN_STATUS,
  })
  status!: string;

  @Column({
    type: DataType.INTEGER,
    field: Order.COLUMN_PRICE,
  })
  price!: string;

  @Column({
    type: DataType.TEXT("long"),
    field: Order.COLUMN_NOTE,
  })
  note!: string;

  @HasMany(() => Order_Items, {
    sourceKey: "id",
    as: "items_Orders",
  })
  items_Orders!: Order_Items[];

  @HasOne(() => Payment, {
    sourceKey: "id",
    as: "pay_Order",
  })
  pay_Order!: Payment;

  @BelongsToMany(() => Coupon, () => Coupon_Order)
  coupons!: Coupon[];

  @HasMany(() => Rating, {
    sourceKey: "id",
    as: "comment_Order", // Thêm mối quan hệ để lấy tất cả phản hồi
  })
  comment_Order!: Rating[];
}
export default Order;

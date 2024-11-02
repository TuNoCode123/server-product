import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import Order from "./model.order";

@Table({
  tableName: Payment.TABLE_NAME,
})
class Payment extends Model {
  public static TABLE_NAME = "Payment" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_ORDER_ID = "orderId" as string;
  public static COLUMN_STATUS = "status" as string;
  public static COLUMN_METHOD = "method" as string;
  public static COLUMN_CURRENCY = "currency" as string;
  public static COLUMN_PRICE = "price" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Payment.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    field: Payment.COLUMN_ORDER_ID,
  })
  orderId!: string;

  @BelongsTo(() => Order, {
    targetKey: "id",
    foreignKey: "orderId",
    as: "order_pay",
  })
  order_pay!: string;

  @Column({
    type: DataType.STRING,
    field: Payment.COLUMN_STATUS,
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    field: Payment.COLUMN_METHOD,
  })
  method!: string;

  @Column({
    type: DataType.STRING,
    field: Payment.COLUMN_CURRENCY,
  })
  currency!: string;

  @Column({
    type: DataType.INTEGER,
    field: Payment.COLUMN_PRICE,
  })
  price!: string;

  //   @HasMany(() => DetailPayment, {
  //     sourceKey: "id",

  //     as: "Payment_detail",
  //   })
  //   Payment_detail!: String;
}
export default Payment;

import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Products from "./model.product";

import Seller from "./model.inforSeller";
import Order from "./model.order";
import Coupon_Order from "./model.coupon_Order";

@Table({
  tableName: Coupon.TABLE_NAME,
})
class Coupon extends Model {
  public static TABLE_NAME = "Coupon" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_DESCRIPTION = "description" as string;
  public static COLUMN_LIMIT = "limit" as string;
  public static COLUMN_DISCOUNT = "disCount" as string;
  public static COLUMN_CONDITION = "condition" as string;

  public static COLUMN_DATETO = "dateTo" as string;
  public static COLUMN_TYPE = "type" as string;
  public static COLUMN_STATUS = "status" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Coupon.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    field: Coupon.COLUMN_DESCRIPTION,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    field: Coupon.COLUMN_LIMIT,
  })
  limit!: string;

  @Column({
    type: DataType.INTEGER,
    field: Coupon.COLUMN_DISCOUNT,
  })
  discount!: string;

  @Column({
    type: DataType.STRING,
    field: Coupon.COLUMN_TYPE,
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    field: Coupon.COLUMN_STATUS,
  })
  status!: string;

  @Column({
    type: DataType.DATE,
    field: Coupon.COLUMN_DATETO,
  })
  dateTo!: string;

  @Column({
    type: DataType.INTEGER,
    field: Coupon.COLUMN_CONDITION,
  })
  condition!: string;

  @BelongsToMany(() => Order, () => Coupon_Order)
  orders!: Order[];
}
export default Coupon;

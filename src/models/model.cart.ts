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

import DetailCart from "./model.detailCart";

@Table({
  tableName: Cart.TABLE_NAME,
})
class Cart extends Model {
  public static TABLE_NAME = "Cart" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Cart.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Cart.COLUMN_USER_ID,
  })
  userId!: string;

  @HasMany(() => DetailCart, {
    sourceKey: "id",

    as: "cart_detail",
  })
  cart_detail!: String;
}
export default Cart;

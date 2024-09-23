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
import Inventory from "./model.inventory";
import Reserve_Inventory from "./model.reserve-inventory";

@Table({
  tableName: Reserve.TABLE_NAME,
})
class Reserve extends Model {
  public static TABLE_NAME = "Reserve" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  public static COLUMN_QUANTITY = "quantity" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Reserve.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Reserve.COLUMN_USER_ID,
  })
  userId!: string;

  @Column({
    type: DataType.INTEGER,
    field: Reserve.COLUMN_QUANTITY,
  })
  quantity!: string;

  @BelongsToMany(() => Inventory, () => Reserve_Inventory)
  reserveS!: Inventory[];
}
export default Reserve;

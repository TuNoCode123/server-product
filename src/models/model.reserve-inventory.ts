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

@Table({
  tableName: Reserve_Inventory.TABLE_NAME,
})
class Reserve_Inventory extends Model {
  public static TABLE_NAME = "Reserve_Inventory" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_RESERVE_ID = "reserveId" as string;
  public static COLUMN_INVENTORY_ID = "inventoryId" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Reserve_Inventory.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Reserve)
  @Column({
    type: DataType.INTEGER,
    field: Reserve_Inventory.COLUMN_RESERVE_ID,
  })
  reserveId!: string;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
    field: Reserve_Inventory.COLUMN_INVENTORY_ID,
  })
  inventoryId!: string;
}
export default Reserve_Inventory;

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
import Products from "./model.product";
import Reserve from "./model.reserve";
import Reserve_Inventory from "./model.reserve-inventory";
import infor_Product from "./model.inforpro";

@Table({
  tableName: Inventory.TABLE_NAME,
})
class Inventory extends Model {
  public static TABLE_NAME = "Inventory" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_PRODUCT_CHILD_ID = "productChildId" as string;
  public static COLUMN_QUANTITY = "quantity" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Inventory.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Inventory.COLUMN_PRODUCT_ID,
  })
  productId!: number;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: "productId",
    as: "inventory_product",
  })
  inventory_product!: Products;

  @ForeignKey(() => infor_Product)
  @Column({
    type: DataType.INTEGER,
    field: Inventory.COLUMN_PRODUCT_CHILD_ID,
  })
  productChildId!: number;

  @BelongsTo(() => infor_Product, {
    targetKey: "id",
    foreignKey: "productId",
    as: "inventory_product_child",
  })
  inventory_product_child!: infor_Product;

  @Column({
    type: DataType.INTEGER,
    field: Inventory.COLUMN_QUANTITY,
  })
  quantity!: string;

  @BelongsToMany(() => Reserve, () => Reserve_Inventory)
  inventories!: Reserve[];
}
export default Inventory;

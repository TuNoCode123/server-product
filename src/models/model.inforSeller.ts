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
import Shop from "./model.Shop";

@Table({
  tableName: Seller.TABLE_NAME,
})
class Seller extends Model {
  public static TABLE_NAME = "Seller" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_SHOP_ID = "ShopId" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Seller.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    field: Seller.COLUMN_SHOP_ID,
  })
  shopId!: string;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Seller.COLUMN_PRODUCT_ID,
  })
  productId!: string;
}
export default Seller;

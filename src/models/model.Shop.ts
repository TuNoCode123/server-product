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
import Inventory from "./model.inventory";
import Reserve_Inventory from "./model.reserve-inventory";
import Seller from "./model.inforSeller";
import Order_Items from "./model.order_Items";

@Table({
  tableName: Shop.TABLE_NAME,
})
class Shop extends Model {
  public static TABLE_NAME = "Shop" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  public static COLUMN_NAME = "name" as string;
  public static COLUMN_IMAGE = "image" as string;
  public static COLUMN_LOGO = "logo" as string;
  public static COLUMN_DESCRIPTION = "description" as string;
  public static COLUMN_PUBLIC_ID_LOGO = "idLogo" as string;
  public static COLUMN_PUBLIC_ID_BACKLOG = "idBacklog" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Shop.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Shop.COLUMN_USER_ID,
  })
  userId!: string;

  @Column({
    type: DataType.STRING,
    field: Shop.COLUMN_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    field: Shop.COLUMN_IMAGE,
  })
  image!: string;

  @Column({
    type: DataType.STRING,
    field: Shop.COLUMN_LOGO,
  })
  logo!: string;

  @Column({
    type: DataType.STRING,
    field: Shop.COLUMN_PUBLIC_ID_LOGO,
  })
  idLogo!: string;

  @Column({
    type: DataType.STRING,
    field: Shop.COLUMN_PUBLIC_ID_BACKLOG,
  })
  idBacklog!: string;

  @Column({
    type: DataType.TEXT("long"),
    field: Shop.COLUMN_DESCRIPTION,
  })
  description!: string;

  @BelongsToMany(() => Products, () => Seller)
  shop_Sellers!: Products[];

  @HasMany(() => Order_Items, {
    sourceKey: "id",
    as: "shop_Orders",
  })
  shop_Orders!: String;
}
export default Shop;

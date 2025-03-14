import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import Products from "./model.product";
import Inventory from "./model.inventory";
import Order_Items from "./model.order_Items";
import Rating from "./model.rating";

@Table({
  tableName: infor_Product.TABLE_NAME,
})
class infor_Product extends Model {
  public static TABLE_NAME = "infor_Product" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_KEY = "k" as string;
  public static COLUMN_VALUE = "v" as string;
  public static COLUMN_IMAGE = "image" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: infor_Product.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: infor_Product.COLUMN_PRODUCT_ID,
  })
  productId!: string;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: infor_Product.COLUMN_PRODUCT_ID,
    as: "img_product",
  })
  @Column({
    type: DataType.STRING(255),
    field: infor_Product.COLUMN_KEY,
  })
  k!: string;

  @Column({
    type: DataType.STRING(255),
    field: infor_Product.COLUMN_VALUE,
  })
  v!: string;

  @Column({
    type: DataType.STRING(255),
    field: infor_Product.COLUMN_IMAGE,
  })
  image!: String;

  @HasOne(() => Inventory, {
    sourceKey: "id",
    as: "product_child_inventory",
  })
  quantity!: string;

  @HasOne(() => Order_Items, {
    sourceKey: "id",
    as: "product_child_order",
  })
  product_child_order!: string;

  @HasMany(() => Rating, {
    sourceKey: "id",
    as: "infor_Rating", // Thêm mối quan hệ để lấy tất cả phản hồi
  })
  infor_Rating!: Rating[];
}
export default infor_Product;

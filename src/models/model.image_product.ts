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
import Attri_Product from "./model.attribute_pro";

@Table({
  tableName: Image_Product.TABLE_NAME,
})
class Image_Product extends Model {
  public static TABLE_NAME = "Image_Product" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_IMAGE = "image" as string;
  public static COLUMN_ATTRIBUTE_ID = "attribute_id" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Image_Product.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Image_Product.COLUMN_PRODUCT_ID,
  })
  productId!: string;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: Image_Product.COLUMN_PRODUCT_ID,
    as: "img_product",
  })
  @Column({
    type: DataType.STRING(255),
    field: Image_Product.COLUMN_IMAGE,
  })
  image!: string;

  @ForeignKey(() => Attri_Product)
  @Column({
    type: DataType.INTEGER,
    field: Image_Product.COLUMN_ATTRIBUTE_ID,
  })
  attributeId!: string;

  @BelongsTo(() => Attri_Product, {
    targetKey: "id",
    foreignKey: Image_Product.COLUMN_ATTRIBUTE_ID,
    as: "img_attri_product",
  })
  img_attri_product!: string;
}
export default Image_Product;

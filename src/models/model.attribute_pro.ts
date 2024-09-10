import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Model,
  Table,
} from "sequelize-typescript";
import Products from "./model.product";
import Image_Product from "./model.image_product";

@Table({
  tableName: Attri_Product.TABLE_NAME,
})
class Attri_Product extends Model {
  public static TABLE_NAME = "Attri_Product" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_KEY = "k" as string;
  public static COLUMN_VALUE = "v" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Attri_Product.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Attri_Product.COLUMN_PRODUCT_ID,
  })
  productId!: string;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: Attri_Product.COLUMN_PRODUCT_ID,
    as: "attri_product",
  })
  @Index({
    name: "key_index",
    type: "FULLTEXT",
  })
  @Column({
    type: DataType.STRING(255),
    field: Attri_Product.COLUMN_KEY,
  })
  k!: string;

  @Column({
    type: DataType.STRING(255),
    field: Attri_Product.COLUMN_VALUE,
  })
  v!: string;

  @HasMany(() => Image_Product, {
    sourceKey: "id",
    as: "img_attri_product",
  })
  img_attri_product!: String;
}
export default Attri_Product;

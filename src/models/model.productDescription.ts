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

@Table({
  tableName: Product_Description.TABLE_NAME,
})
class Product_Description extends Model {
  public static TABLE_NAME = "Product_Description" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_TEXT = "text" as string;
  public static COLUNM_HTML = "html" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Product_Description.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Product_Description.COLUMN_PRODUCT_ID,
  })
  productId!: string;

  @Column({
    type: DataType.TEXT("long"),
    field: Product_Description.COLUMN_TEXT,
  })
  text!: string;

  @Column({
    type: DataType.TEXT("long"),
    field: Product_Description.COLUNM_HTML,
  })
  html!: string;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: "productId",
    as: "des_pro",
  })
  des_pro!: string;
}
export default Product_Description;

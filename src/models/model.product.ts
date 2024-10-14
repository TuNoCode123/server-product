import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import Attri_Product from "./model.attribute_pro";
import Image_Product from "./model.image_product";
import infor_Product from "./model.inforpro";
import Category from "./model.category";
import Inventory from "./model.inventory";
import Product_Description from "./model.productDescription";
import Seller from "./model.inforSeller";
import Shop from "./model.Shop";

@Table({
  tableName: Products.TABLE_NAME,
})
class Products extends Model {
  public static TABLE_NAME = "Products" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_NAME_VI = "nameVi" as string;
  public static COLUMN_NAME_EN = "nameEn" as string;
  public static COLUMN_DESCRIPTION = "description" as string;
  public static COLUMN_PRICE = "price" as string;
  public static COLUMN_DISCOUNT = "discount" as string;
  public static COLUMN_TOTAL_RATINGS = "totalRatings" as string;
  public static COLUMN_TOTAL_PRICE = "totalPrices" as string;
  public static COLUMN_TOTAL_STARTS = "totalStarts" as string;
  public static COLUMN_HOT = "hot" as string;
  public static COLUMN_CATEGORY_ID = "categoryId" as string;
  public static COLUMN_BRANCH = "branch" as string;
  public static COLUMN_IMAGE = "image" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Products.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_NAME_VI,
  })
  nameVi!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_NAME_EN,
  })
  nameEn!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_DESCRIPTION,
  })
  description!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_IMAGE,
  })
  image!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_BRANCH,
  })
  branch!: string;

  @Column({
    type: DataType.FLOAT,
    field: Products.COLUMN_PRICE,
  })
  price!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_DISCOUNT,
  })
  discount!: string;

  @Column({
    type: DataType.FLOAT,
    field: Products.COLUMN_TOTAL_PRICE,
  })
  totalPrices!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_TOTAL_RATINGS,
  })
  totalRatings!: string;

  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_TOTAL_STARTS,
  })
  totalStars!: string;
  @Column({
    type: DataType.STRING(255),
    field: Products.COLUMN_HOT,
  })
  hot!: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    field: Products.COLUMN_CATEGORY_ID,
  })
  categoryId!: string;

  @BelongsTo(() => Category, {
    targetKey: "id",
    foreignKey: "categoryId",
    as: "pro_cate",
  })
  pro_cate!: string;

  @HasMany(() => Attri_Product, {
    sourceKey: "id",
    as: "at_product",
  })
  at_product!: String;

  @HasMany(() => Image_Product, {
    sourceKey: "id",
    as: "img_product",
  })
  img_product!: String;

  @HasMany(() => infor_Product, {
    sourceKey: "id",
    as: "infor_product",
  })
  infoProduct!: String;

  @HasMany(() => Inventory, {
    sourceKey: "id",
    as: "product_inventory",
  })
  product_inventory!: String;

  @HasOne(() => Product_Description, {
    sourceKey: "id",
    as: "pro_des",
  })
  pro_des!: String;

  @BelongsToMany(() => Shop, () => Seller)
  pro_Seller!: Shop[];
}
export default Products;

import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import Products from "./model.product";

@Table({
  tableName: Category.TABLE_NAME,
})
class Category extends Model {
  public static TABLE_NAME = "Category" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_NAME_VI = "nameVi" as string;
  public static COLUMN_NAME_EN = "nameEn" as string;
  public static COLUMN_PARENTS_ID = "parentId" as string;
  public static COLUMN_PUBLICE_ID = "publicId" as string;
  public static COLUMN_IMAGE = "image" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Category.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    field: Category.COLUMN_NAME_VI,
  })
  nameVi!: string;

  @Column({
    type: DataType.STRING(255),
    field: Category.COLUMN_NAME_EN,
  })
  nameEn!: string;

  @Column({
    type: DataType.STRING(255),
    field: Category.COLUMN_IMAGE,
  })
  image!: string;

  @Column({
    type: DataType.STRING(255),
    field: Category.COLUMN_PUBLICE_ID,
  })
  publicId!: string;

  @Column({
    type: DataType.INTEGER,
    field: Category.COLUMN_PARENTS_ID,
  })
  parentId!: string;

  @HasMany(() => Products, {
    sourceKey: "id",
    foreignKey: "categoryId",
    as: "cate_pro",
  })
  cate_pro!: String;
}
export default Category;

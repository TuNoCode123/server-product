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
import Comment from "./model.comment";

@Table({
  tableName: Image_Comment.TABLE_NAME,
})
class Image_Comment extends Model {
  public static TABLE_NAME = "Image_Comment" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_COMMENT_ID = "commentId" as string;
  public static COLUMN_IMAGE = "image" as string;
  public static COLUMN_PUBLIC_ID = "publicId" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Image_Comment.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.INTEGER,
    field: Image_Comment.COLUMN_COMMENT_ID,
  })
  commentId!: number;

  @BelongsTo(() => Comment, {
    targetKey: "id",
    foreignKey: "commentId",
    as: "comment_img",
  })
  comment_img!: Comment;

  @Column({
    type: DataType.STRING,
    field: Image_Comment.COLUMN_IMAGE,
  })
  image!: string;

  @Column({
    type: DataType.STRING,
    field: Image_Comment.COLUMN_PUBLIC_ID,
  })
  publicId!: string;
}
export default Image_Comment;

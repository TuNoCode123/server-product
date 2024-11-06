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
import Image_Comment from "./model.image_comment";
import Rating from "./model.rating";
import Reply from "./model.reply";

@Table({
  tableName: Comment.TABLE_NAME,
})
class Comment extends Model {
  public static TABLE_NAME = "Comment" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  public static COLUMN_RATING_ID = "ratingId" as string;
  public static COLUMN_CONTENT = "content" as string;
  public static COLUMN_FIRST_NAME = "firstName" as string;
  public static COLUMN_LAST_NAME = "lastName" as string;
  public static COLUMN_IMAGE = "image" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Comment.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Comment.COLUMN_USER_ID,
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
    field: Comment.COLUMN_FIRST_NAME,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    field: Comment.COLUMN_LAST_NAME,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    field: Comment.COLUMN_IMAGE,
  })
  image!: string;

  @ForeignKey(() => Rating)
  @Column({
    type: DataType.INTEGER,
    field: Comment.COLUMN_RATING_ID,
  })
  ratingId!: number;

  @Column({
    type: DataType.TEXT("long"),
    field: Comment.COLUMN_CONTENT,
  })
  content!: string;

  @HasMany(() => Image_Comment, {
    sourceKey: "id",
    as: "image_comment", // Thêm mối quan hệ để lấy tất cả phản hồi
  })
  image_comment!: Image_Comment[];

  @BelongsTo(() => Rating, {
    targetKey: "id",
    foreignKey: "ratingId",
    as: "rating_comment",
  })
  rating_comment!: Rating;

  @HasMany(() => Reply, {
    sourceKey: "id",
    as: "replies_Comment", // Thêm mối quan hệ để lấy tất cả phản hồi
  })
  replies_Comment!: Reply[];
}
export default Comment;

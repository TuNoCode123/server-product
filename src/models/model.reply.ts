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
import Comment from "./model.comment";

@Table({
  tableName: Reply.TABLE_NAME,
})
class Reply extends Model {
  public static TABLE_NAME = "Reply" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  public static COLUMN_COMMENT_ID = "commentId" as string;
  public static COLUMN_CONTENT = "content" as string;
  public static COLUMN_PARENT_ID = "parentId" as string;
  public static COLUMN_FIRST_NAME = "firstName" as string;
  public static COLUMN_LAST_NAME = "lastName" as string;
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Reply.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Reply.COLUMN_USER_ID,
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
    field: Reply.COLUMN_FIRST_NAME,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    field: Reply.COLUMN_LAST_NAME,
  })
  lastName!: string;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.INTEGER,
    field: Reply.COLUMN_COMMENT_ID,
  })
  commentId!: number;

  @Column({
    type: DataType.TEXT("long"),
    field: Reply.COLUMN_CONTENT,
  })
  content!: string;

  @ForeignKey(() => Reply)
  @Column({
    type: DataType.INTEGER,
    field: Reply.COLUMN_PARENT_ID,
  })
  parentId!: string;

  @BelongsTo(() => Reply, {
    targetKey: "id",
    foreignKey: "parentId",
    as: "responsers",
  })
  responsers!: Reply;

  @HasMany(() => Reply, {
    sourceKey: "id",
    as: "replies", // Thêm mối quan hệ để lấy tất cả phản hồi
  })
  replies!: Reply[];

  @BelongsTo(() => Comment, {
    targetKey: "id",
    foreignKey: "commentId",
    as: "comment_Reply",
  })
  comment_Reply!: Comment;
}
export default Reply;

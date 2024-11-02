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
import Order from "./model.order";

@Table({
  tableName: Rating.TABLE_NAME,
})
class Rating extends Model {
  public static TABLE_NAME = "Rating" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_STAR = "star" as string;
  public static COLUMN_ORDER_ID = "orderId" as string;
  public static COLUMN_STATUS = "status" as string;
  public static COLUMN_CONTENT = "content" as string;
  public static COLUMN_TOTAL_LIKE = "totalLike" as string;
  public static COLUMN_TOTAL_RESPONSE = "totalResponse" as string;
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Rating.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Rating.COLUMN_PRODUCT_ID,
  })
  productId!: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    field: Rating.COLUMN_ORDER_ID,
  })
  orderId!: string;

  @Column({
    type: DataType.INTEGER,
    field: Rating.COLUMN_STAR,
  })
  star!: string;

  @Column({
    type: DataType.STRING,
    field: Rating.COLUMN_STATUS,
  })
  status!: string;

  @Column({
    type: DataType.TEXT("long"),
    field: Rating.COLUMN_CONTENT,
  })
  content!: string;

  @Column({
    type: DataType.INTEGER,
    field: Rating.COLUMN_TOTAL_LIKE,
  })
  totalLike!: string;

  @Column({
    type: DataType.INTEGER,
    field: Rating.COLUMN_TOTAL_RESPONSE,
  })
  totalResponse!: string;

  @HasMany(() => Comment, {
    sourceKey: "id",
    as: "comment_rating", // Thêm mối quan hệ để lấy tất cả phản hồi
  })
  image_comment!: Comment[];

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: "productId",
    as: "pro_Comment",
  })
  pro_Comment!: Products;

  @BelongsTo(() => Order, {
    targetKey: "id",
    foreignKey: "orderId",
    as: "order_Comment",
  })
  order_Comment!: Order;
}
export default Rating;

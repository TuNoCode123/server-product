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
import Rating from "./model.rating";

@Table({
  tableName: Liker.TABLE_NAME,
})
class Liker extends Model {
  public static TABLE_NAME = "Liker" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_USER_ID = "userId" as string;
  public static COLUMN_RATING_ID = "ratingId" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Liker.COLUMN_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: Liker.COLUMN_USER_ID,
  })
  userId!: string;

  @ForeignKey(() => Rating)
  @Column({
    type: DataType.INTEGER,
    field: Liker.COLUMN_RATING_ID,
  })
  ratingId!: string;

  @BelongsTo(() => Rating, {
    targetKey: "id",
    foreignKey: "ratingId",
    as: "liker_Rating",
  })
  liker_Rating!: Rating;
}
export default Liker;

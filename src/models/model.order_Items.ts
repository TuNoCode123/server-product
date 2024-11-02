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
import Order from "./model.order";
import Products from "./model.product";
import infor_Product from "./model.inforpro";
import Shop from "./model.Shop";

@Table({
  tableName: Order_Items.TABLE_NAME,
})
class Order_Items extends Model {
  public static TABLE_NAME = "Order_Items" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_ORDER_ID = "orderId" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_SHOP_ID = "shopId" as string;
  public static COLUMN_STATUS = "status" as string;
  public static COLUMN_PRODUCT_CHILD_ID = "productChildId" as string;
  public static COLUMN_QUANTITY = "quantity" as string;
  public static COLUMN__PRICE = "price" as string;
  public static COLUMN__NOTE = "note" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: Order_Items.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    field: Order_Items.COLUMN_ORDER_ID,
  })
  orderId!: string;

  @BelongsTo(() => Order, {
    targetKey: "id",
    foreignKey: "orderId",
    as: "order_items",
  })
  order_items!: Order;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: Order_Items.COLUMN_PRODUCT_ID,
  })
  productId!: string;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: "productId",
    as: "pro_Order",
  })
  pro_Order!: Products;
  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    field: Order_Items.COLUMN_SHOP_ID,
  })
  shopId!: string;

  @BelongsTo(() => Shop, {
    targetKey: "id",
    foreignKey: "shopId",
    as: "shop_Order",
  })
  @ForeignKey(() => infor_Product)
  @Column({
    type: DataType.INTEGER,
    field: Order_Items.COLUMN_PRODUCT_CHILD_ID,
  })
  productChildId!: string;

  @BelongsTo(() => infor_Product, {
    targetKey: "id",
    foreignKey: "productChildId",
    as: "infor_Order",
  })
  infor_Order!: infor_Product;

  @Column({
    type: DataType.INTEGER,
    field: Order_Items.COLUMN_QUANTITY,
  })
  quantity!: string;

  @Column({
    type: DataType.INTEGER,
    field: Order_Items.COLUMN__PRICE,
  })
  price!: string;

  @Column({
    type: DataType.STRING,
    field: Order_Items.COLUMN_STATUS,
  })
  status!: string;

  @Column({
    type: DataType.TEXT("long"),
    field: Order_Items.COLUMN__NOTE,
  })
  note!: string;
  //   @HasMany(() => DetailOrder_Items, {
  //     sourceKey: "id",

  //     as: "Order_Items_detail",
  //   })
  //   Order_Items_detail!: String;
}
export default Order_Items;

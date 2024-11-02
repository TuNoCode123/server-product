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

import Seller from "./model.inforSeller";
import Shop from "./model.Shop";
import infor_Product from "./model.inforpro";
import Cart from "./model.cart";

@Table({
  tableName: DetailCart.TABLE_NAME,
})
class DetailCart extends Model {
  public static TABLE_NAME = "DetailCart" as string;
  public static COLUMN_ID = "id" as string;
  public static COLUMN_CART_ID = "cartId" as string;
  public static COLUMN_PRODUCT_ID = "productId" as string;
  public static COLUMN_CHILD_PRODUCT_ID = "childProductId" as string;
  public static COLUMN_SHOP_ID = "shopId" as string;
  public static COLUMN_QUANTITY = "quantity" as string;
  public static COLUMN_TOTALPRICES = "totalPrices" as string;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: DetailCart.COLUMN_ID,
  })
  id!: number;

  @ForeignKey(() => Cart)
  @Column({
    type: DataType.INTEGER,
    field: DetailCart.COLUMN_CART_ID,
  })
  cartId!: string;

  @BelongsTo(() => Cart, {
    targetKey: "id",
    foreignKey: "cartId",
    as: "cart",
  })
  cart!: Cart;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    field: DetailCart.COLUMN_PRODUCT_ID,
  })
  productId!: string;

  @BelongsTo(() => Products, {
    targetKey: "id",
    foreignKey: "productId",
    as: "product",
  })
  product!: Products;

  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    field: DetailCart.COLUMN_SHOP_ID,
  })
  shopId!: string;

  @BelongsTo(() => Shop, {
    targetKey: "id",
    foreignKey: "shopId",
    as: "shop",
  })
  shop!: Shop;

  @ForeignKey(() => infor_Product)
  @Column({
    type: DataType.INTEGER,
    field: DetailCart.COLUMN_CHILD_PRODUCT_ID,
  })
  childProductId!: string;

  @BelongsTo(() => infor_Product, {
    targetKey: "id",
    foreignKey: "childProductId",
    as: "infor_product",
  })
  childProduct!: infor_Product;

  @Column({
    type: DataType.INTEGER,
    field: DetailCart.COLUMN_QUANTITY,
  })
  type!: string;

  @Column({
    type: DataType.INTEGER,
    field: DetailCart.COLUMN_TOTALPRICES,
  })
  totalPrices!: string;
}
export default DetailCart;

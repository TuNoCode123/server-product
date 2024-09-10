import { Sequelize } from "sequelize-typescript";
import "dotenv/config";
import Products from "../models/model.product";
import Attri_Product from "../models/model.attribute_pro";
import Image_Product from "../models/model.image_product";
import infor_Product from "../models/model.inforpro";
import Category from "../models/model.category";

class Database {
  public sequelize: Sequelize | undefined;
  private DB_NAME = process.env.DB_NAME as string;
  private DB_DIALECT = process.env.DB_DIALECT as any;
  private DB_USERNAME = process.env.DB_USERNAME as string;
  private DB_PASSWORD = process.env.DB_PASSWORD as string;
  private DB_HOST = process.env.DB_LOCALHOST as string;
  constructor() {
    this.connectToDb();
  }
  private connectToDb = async () => {
    try {
      this.sequelize = new Sequelize({
        database: this.DB_NAME,
        dialect: this.DB_DIALECT,
        username: this.DB_USERNAME,
        password: this.DB_PASSWORD,
        host: this.DB_HOST,
        models: [
          Products,
          Attri_Product,
          Image_Product,
          infor_Product,
          Category,
        ],
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000, // 30 giây
          idle: 10000, // 10 giây
          evict: 10000, // 10 giây
        },
        dialectOptions: {
          connectTimeout: 60000, // 60 giây
        },
      });
      await this.sequelize.authenticate();
      console.log("Connect postgres successfully");
    } catch (error) {
      console.log("Connect postgres fail", error);
    }
  };
}
export default Database;

import { MongoClient } from "mongodb";
import mongoose from "mongoose";
const url = "mongodb://localhost:27017";
export const client = new MongoClient(url);

const dbName = "tikiMessage";
async function Connect_To_Mongo() {
  // Use connect method to connect to the server
  await client.connect();
  client.db(dbName);
  await mongoose
    .connect(process.env.MONGO ? process.env.MONGO : "")
    .then(() => console.log("Connected mongo successfully!"))
    .catch(() => {
      console.log("Connected mongo failed!");
    });

  return "done.";
}
export default Connect_To_Mongo;

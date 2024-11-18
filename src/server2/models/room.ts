import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    members: Array,
  },
  {
    timestamps: true,
  }
);
const dbRoom = mongoose.model("rooms", RoomSchema);
export default dbRoom;

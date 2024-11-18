import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    roomId: String,
    senderId: String,
    text: String,
    image: String,
  },
  {
    timestamps: true,
  }
);

const dbChat = mongoose.model("chats", ChatSchema);
export default dbChat;

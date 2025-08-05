import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["text", "image", "video", "voice"],
      default: "text",
    },
    content: { type: String },
    mediaUrl: { type: String },
    isRead: { type: Boolean, default: false },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true },
        reactedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

import mongoose, { mongo, Schema } from "mongoose";
const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    media: [{ type: String }],
    thumbnail: { type: String },
    mood: { type: String },
    tags: [{ type: String }],
    location: { type: String },
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    postType: {
      type: String,
      enum: ["text", "image", "video", "audio", "poll", "link"],
      default: "text",
    },
    expiresAt: { type: Date },
    sharedPostId: { type: Schema.Types.ObjectId, ref: "Post" },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search functionality
PostSchema.index({ content: "text", tags: "text" });

export const PostModel =
  mongoose.models.Post || mongoose.model("Post", PostSchema);

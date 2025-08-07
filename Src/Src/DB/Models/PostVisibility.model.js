import mongoose, { Schema } from "mongoose";

const PostVisibilitySchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  allowedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  grantedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  grantedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index to ensure unique post-user combinations
PostVisibilitySchema.index({ post: 1, allowedUser: 1 }, { unique: true });

export const PostVisibilityModel = 
  mongoose.models.PostVisibility || mongoose.model("PostVisibility", PostVisibilitySchema); 
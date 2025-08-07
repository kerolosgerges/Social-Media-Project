import mongoose, { Schema } from "mongoose";

const ReactionSchema = new Schema({
    post:   { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:   { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], default: 'like', required: true },
    emoji:  { type: String, default: '👍', required: true }
  }, { timestamps: true });

  export const ReactionModel = mongoose.models.Reaction || mongoose.model('Reaction', ReactionSchema);
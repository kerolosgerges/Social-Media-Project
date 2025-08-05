import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      minlength: [3, "username must be at least 3 characters long"],
      maxlength: [20, "username must be at most 20 characters long"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
      lowercase: true,
      validate: {
        validator: (val) => {
          return /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(val);
        },
        message: "email must be a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
      validate: {
        validator: (val) => {
          return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(
            val
          );
        },
        message:
          "password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "bio must be at most 500 characters long"],
    },
    status: { type: String, default: "" },
    moodStatus: { type: String, default: "" },
    phone: {
      type: String,
    },
    address: { type: String },
    birthday: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      github: { type: String },
      linkedin: { type: String },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);

// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

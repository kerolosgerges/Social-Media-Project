import { UserModel } from "../../../DB/Models/User.model.js";
import { encrypt } from "../../../Utils/encryption.utils.js";
import bcrypt from "bcryptjs";
import { SharedAccountModel } from "../../../DB/Models/SharedAccount.model.js";

export const getProfile = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: "failure", error: "User not found" });
  }
  return res.status(200).json({ status: "success", user });
};

export const getAllUsers = async (req, res) => {
  const users = await UserModel.find();
  return res.status(200).json({ status: "success", users });
};

export const createAdmin = async (req, res) => {
  const isUserExist = await UserModel.findOne({ email: req.body.email });
  if (isUserExist) {
    return res
      .status(409)
      .json({ status: "failure", message: "Email already in use" });
  }
  const hashedPassword = bcrypt.hashSync(
    req.body.password,
    Number(process.env.SALT)
  );
  req.body.password = hashedPassword;
  req.body.phone = encrypt(req.body.phone, process.env.PHONE_ENCRYPTION_KEY);
  req.body.address = encrypt(
    req.body.address,
    process.env.ADDRESS_ENCRYPTION_KEY
  );

  const user = await UserModel.create(req.body);

  return res.status(201).json({
    status: "success",
    message:
      user.role == "admin"
        ? "Admin created successfully"
        : "User created successfully",
    user,
  });
};

export const updateProfile = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: "failure", error: "User not found" });
  }

  const encryptedPhone = req.body.phone
    ? encrypt(req.body.phone, process.env.PHONE_ENCRYPTION_KEY)
    : user.phone;
  const encryptedAddress = req.body.address
    ? encrypt(req.body.address, process.env.ADDRESS_ENCRYPTION_KEY)
    : user.address;

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    {
      ...req.body,
      phone: encryptedPhone,
      address: encryptedAddress,
    },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    user: updatedUser,
  });
};

export const updateUserPassword = async (req, res) => {
  const data = req.body;
  const user = req.user;
  console.log(user);
  if (!user) {
    return res.status(404).json({ status: "failure", error: "User not found" });
  }
  const isMatch = bcrypt.compareSync(data.oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      status: "failure",
      error: "Old password is incorrect",
    });
  }

  const hashedPassword = bcrypt.hashSync(
    data.password,
    Number(process.env.SALT)
  );
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
};

export const freezeProfile = async (req, res) => {
  const user = req.user;

  user.isDeleted = true;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Profile has been frozen successfully",
  });
};

export const activateAccount = async (req, res) => {
  const data = req.body;

  const user = await UserModel.findOne({ email: data.email });
  if (!user) {
    return res.status(404).json({ status: "failure", error: "User not found" });
  }
  const isMatch = bcrypt.compareSync(data.password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      status: "failure",
      error: "User not found",
    });
  }
  user.isDeleted = false;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Profile has been activated successfully",
  });
};

export const deleteProfile = async (req, res) => {
  const { profileId } = req.params;
  const user = await UserModel.findByIdAndDelete(profileId);
  if (!user) {
    return res.status(404).json({ status: "failure", error: "User not found" });
  }
  return res.status(200).json({ status: "success", message: "User deleted" });
};

export const deleteAllUsers = async (req, res) => {
  const users = await UserModel.deleteMany({ email: { $ne: req.user.email } });
  if (!users) {
    return res
      .status(404)
      .json({ status: "failure", error: "Users not found" });
  }
  return res
    .status(200)
    .json({ status: "success", message: "Users deleted successfully" });
};

export const shareAccount = async (req, res) => {
  const { userId, email, permissions } = req.body;
  let sharedWithUser = null;
  if (userId) {
    sharedWithUser = await UserModel.findById(userId);
  } else if (email) {
    sharedWithUser = await UserModel.findOne({ email });
  }
  if (!sharedWithUser) {
    return res.status(404).json({ status: "failure", error: "User to share with not found" });
  }
  const sharedAccount = await SharedAccountModel.create({
    ownerId: req.user._id,
    sharedWithId: sharedWithUser._id,
    permissions: permissions || ["read"]
  });
  res.status(201).json({ status: "success", sharedAccount });
};

export const getSharedAccounts = async (req, res) => {
  const sharedAccounts = await SharedAccountModel.find({ sharedWithId: req.user._id });
  res.status(200).json({ status: "success", sharedAccounts });
};

export const getMySharedAccounts = async (req, res) => {
  const mySharedAccounts = await SharedAccountModel.find({ ownerId: req.user._id });
  res.status(200).json({ status: "success", mySharedAccounts });
};

export const removeSharedAccess = async (req, res) => {
  const { shareId } = req.params;
  await SharedAccountModel.findByIdAndDelete(shareId);
  res.status(200).json({ status: "success", message: "Shared access removed" });
};

import { UserModel } from "../../../DB/Models/User.model.js";

// Get user status (online/offline + last seen)
export const getUserStatus = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // Check if user exists
  const user = await UserModel.findById(userId).select("username isOnline lastSeen");
  if (!user) {
    return res.status(404).json({
      status: "failure",
      error: "User not found",
    });
  }

  // Format the response
  const status = {
    userId: user._id,
    username: user.username,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    status: user.isOnline ? "online" : "offline",
  };

  // Add "last seen" text for offline users
  if (!user.isOnline && user.lastSeen) {
    const now = new Date();
    const diffMs = now - user.lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      status.lastSeenText = "Just now";
    } else if (diffMins < 60) {
      status.lastSeenText = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      status.lastSeenText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      status.lastSeenText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  }

  return res.status(200).json({
    status: "success",
    userStatus: status,
  });
};

// Update current user's status
export const updateUserStatus = async (req, res) => {
  const userId = req.user._id;
  const { status, customStatus } = req.body;

  try {
    const updateData = {};
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (customStatus !== undefined) {
      updateData.customStatus = customStatus;
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("username status customStatus");

    return res.status(200).json({
      status: "success",
      message: "User status updated successfully",
      user: {
        username: user.username,
        status: user.status,
        customStatus: user.customStatus,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      status: "failure",
      error: "Failed to update user status",
    });
  }
}; 
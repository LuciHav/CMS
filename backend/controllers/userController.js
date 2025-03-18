import UserModel from '../Models/userModel.js';  // Import your User model

export const getUserData = async (req, res) => {
  try {
    const userId = req.body.userID;  

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user data from the database using the UserModel
    const user = await UserModel.findById(userId);  

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive data such as password before sending the response
    const { password, ...userData } = user.toObject();

    return res.status(200).json({
      message: "User data retrieved successfully",
      userData,  // Return the user data excluding password
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      message: "Error occurred while fetching user data",
      error: error.message,
    });
  }
};

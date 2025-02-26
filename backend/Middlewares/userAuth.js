import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/userModel.js"; // Ensure the path to the User model is correct

dotenv.config({ path: '../dotenv' });

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;  // Get the token from cookies
    console.log("Token from cookies:", token); // Log the token for debugging

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Log the decoded token

        // Check if the token has expired
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ message: "Token has expired" });
        }

        // Attach userId to the request body if the token contains the userId
        if (decoded.userId) {
            req.body.userID = decoded.userId;
        } else {
            return res.status(401).json({ message: "Unauthorized login due to missing user ID in token" });
        }

        // Fetch the user from the database to verify if the user is verified
        const user = await User.findById(decoded.userId);
        if (!user || !user.isVerified) {
            return res.status(401).json({ message: "User is not verified, unauthorized login" });
        }

        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Error verifying token:", err);  // Log error for debugging
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default userAuth;

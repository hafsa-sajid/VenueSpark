import genToken from "../config/token.js";
import User from "../models/user.model.js";
import TempUser from "../models/tempUser.model.js";
import ResetOtp from "../models/resetOtp.model.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../config/email.js";
import crypto from "crypto";

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signUp = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        
        let existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Temporarily store user data and OTP
        let hashPassword = await bcrypt.hash(password, 10);
        
        // Remove existing temp user if they are trying to sign up again without verifying previous OTP
        await TempUser.findOneAndDelete({ email });
        
        await TempUser.create({ name, email, password: hashPassword, otp });

        // Send OTP via email
        const message = `Your Object Registration OTP is: ${otp}. It will expire in 10 minutes.`;
        await sendEmail(email, "Sign-up OTP Verification", message);

        return res.status(200).json({ message: "OTP sent to your email. Please verify." });

    } catch (error) {
        console.error("Signup failed:", error);
        return res.status(500).json({
            message: `Signup failed. Details: ${error.message}`
        });
    }
};

export const verifySignUpOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;
        
        let tempUser = await TempUser.findOne({ email });
        if (!tempUser) {
            return res.status(400).json({ message: "OTP Expired or Invalid Email" });
        }

        if (tempUser.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Move to permanent User collection
        let user = await User.create({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password
        });

        // Delete temp user
        await TempUser.findByIdAndDelete(tempUser._id);

        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "User Verified and Registered",
            ...user.toObject(),
            token
        });

    } catch (error) {
        console.error("Verification failed:", error);
        return res.status(500).json({
            message: `Verification failed. Details: ${error.message}`
        });
    }
};

export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await User.findOne({ email }).populate("listing");
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password" });
        }
        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            ...user.toObject(),
            token: token
        });

    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({
            message: `Login failed. Details: ${error.message}`
        });
    }
};

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logout Successfully" });
    } catch (error) {
        console.error("Logout failed:", error);
        return res.status(500).json({
            message: `LogOut failed. Details: ${error.message}`
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email not found in database" });
        }

        const otp = generateOTP();
        await ResetOtp.findOneAndDelete({ email });
        await ResetOtp.create({ email, otp });

        const message = `Your Password Reset OTP is: ${otp}. It will expire in 5 minutes.`;
        await sendEmail(email, "Password Reset Validated OTP", message);

        return res.status(200).json({ message: "Reset OTP sent to your email" });
    } catch (error) {
         console.error("Forgot Password failed:", error);
         return res.status(500).json({ message: `Failed. Details: ${error.message}` });
    }
};

export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const resetRecord = await ResetOtp.findOne({ email });
        
        if (!resetRecord) {
            return res.status(400).json({ message: "OTP Expired or Invalid Email" });
        }
        if (resetRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        return res.status(200).json({ message: "OTP Verified. You can reset your password now." });
    } catch (error) {
         console.error("Verify Reset OTP failed:", error);
         return res.status(500).json({ message: `Failed. Details: ${error.message}` });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        const resetRecord = await ResetOtp.findOne({ email });
        
        if (!resetRecord || resetRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP session for reset" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashPassword });

        // Cleanup
        await ResetOtp.findOneAndDelete({ email });

        return res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
         console.error("Reset Password failed:", error);
         return res.status(500).json({ message: `Failed. Details: ${error.message}` });
    }
};
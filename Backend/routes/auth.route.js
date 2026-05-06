import express from "express"
import { login, logOut, signUp, verifySignUpOtp, forgotPassword, verifyResetOtp, resetPassword } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/signup", signUp)
authRouter.post("/verify-signup", verifySignUpOtp)
authRouter.post("/login", login)
authRouter.post("/logOut", logOut)

authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/verify-reset-otp", verifyResetOtp)
authRouter.post("/reset-password", resetPassword)

export default authRouter
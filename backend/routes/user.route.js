import express from "express"
import { getCurrentUser, markNotificationsRead, deleteNotification } from "../controllers/user.controller.js"
import isAuth from "../middleware/isAuth.js"


let userRouter = express.Router()

userRouter.get("/currentuser",isAuth,getCurrentUser)
userRouter.put("/mark-read-notifications", isAuth, markNotificationsRead)
userRouter.delete("/notifications/:notificationId", isAuth, deleteNotification)

export default userRouter
import express from "express";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import { cancelBooking, createBooking, getUserBookings, getHostBookings, manualCleanupBookings } from "../controllers/booking.controller.js";

const bookingRouter = express.Router();

bookingRouter.post("/create/:id", isAuth, upload.single("paymentProof"), createBooking);
bookingRouter.put("/cancel/:id", isAuth, cancelBooking);
bookingRouter.get("/user-bookings", isAuth, getUserBookings);
bookingRouter.get("/cleanup-test", manualCleanupBookings);

// Naya Route: Owner/Host apni listings ki bookings dekhne ke liye
bookingRouter.get("/host-bookings", isAuth, getHostBookings);

export default bookingRouter;
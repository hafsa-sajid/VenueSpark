import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notifications: [
    {
        message: { type: String },
        type: { type: String },
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        complaintId: { type: String },
        replyText: { type: String },
        date: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }
  ],
  
  // Aapke dwara upload ki gayi listings
  listing: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }], 
  
  // Jo ghar aapne book kiye hain
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],

  // Refunded Amount Wallet
  walletBalance: { type: Number, default: 0 }
}, { timestamps: true });

// FIX: Check if model exists before creating
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
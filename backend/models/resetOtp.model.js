import mongoose from "mongoose";

const resetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 300 seconds = 5 minutes
});

const ResetOtp = mongoose.models.ResetOtp || mongoose.model("ResetOtp", resetOtpSchema);

export default ResetOtp;

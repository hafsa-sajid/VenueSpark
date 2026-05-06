import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // 600 seconds = 10 minutes
});

const TempUser = mongoose.models.TempUser || mongoose.model("TempUser", tempUserSchema);

export default TempUser;

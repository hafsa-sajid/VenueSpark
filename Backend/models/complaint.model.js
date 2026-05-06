import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  reply: { 
    type: String, 
    default: "" 
  },
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Replied", "Resolved"], 
    default: "Pending" 
  }
}, { timestamps: true });

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
export default Complaint;

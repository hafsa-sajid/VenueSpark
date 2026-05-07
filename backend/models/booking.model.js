import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Listing", 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  price: { type: Number, required: true },
  
  status: { 
    type: String, 
    enum: ['Booked', 'Completed', 'Cancelled', 'Cancel_Requested'], 
    default: 'Booked' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Stripe', 'Manual'], 
    default: 'Manual'
  },
  transactionId: { 
    type: String, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending' 
  },
  refundStatus: {
    type: String,
    enum: ['None', 'Pending', 'Refunded', 'Rejected'],
    default: 'None'
  },
  refundDetails: {
    method: { type: String, enum: ['Easypaisa', 'Jazzcash', 'Bank Transfer', 'Wallet', 'None'], default: 'None' },
    accountNo: { type: String, default: '' },
    accountName: { type: String, default: '' },
    requestedAt: { type: Date }
  },
  paymentProof: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
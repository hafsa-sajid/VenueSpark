import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  images: { 
    type: [String], 
    validate: [v => v.length > 0, "At least one image is required"] 
  }, 
  rent: { type: Number, required: true },
  city: { type: String, required: true },
  landmark: { type: String, required: true }, 
  latitude: { type: Number },
  longitude: { type: Number },
  category: { type: String, required: true },
  ratings: { type: Number, min: 0, max: 5, default: 0 },
  isBooked: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// Virtual field for bookings (Optional but good practice)
listingSchema.virtual('bookingDetails', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'listing',
  justOne: true
});

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
export default Listing;
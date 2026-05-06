import uploadOnCloudinary from "../config/cloudinary.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

// 1. Add New Listing (Fixed Response)
export const addListing = async (req, res) => {
  try {
    const host = req.userId || req.user?._id;
    console.log("Add Listing - userId from token:", host);
    const existingUser = await User.findById(host);
    if (!existingUser) {
      console.log("User NOT found in DB for id:", host);
      return res.status(404).json({ message: "User not found." });
    }

    const { title, description, rent, city, landmark, latitude, longitude, category } = req.body;
    const imageUrls = [];
    
    if (req.files) {
      const fileKeys = Object.keys(req.files);
      for (const key of fileKeys) {
        if (req.files[key] && req.files[key][0]) {
          const url = await uploadOnCloudinary(req.files[key][0].path);
          if (url) imageUrls.push(url);
        }
      }
    }

    const listing = await Listing.create({
      title, 
      description, 
      rent: Number(rent), 
      city,
      landmark,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      category, 
      images: imageUrls, 
      host
    });

    await User.findByIdAndUpdate(host, { $push: { listing: listing._id } });
    
    // Frontend ko direct object ya specific key ke sath bhejein
    return res.status(201).json(listing);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Get All Listings
export const getListing = async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).lean();
    const allBookings = await Booking.find({ status: 'Booked' }).select('_id listing');

    const updatedListings = listings.map(listing => {
      const foundBooking = allBookings.find(b => b.listing.toString() === listing._id.toString());
      return {
        ...listing,
        bookingId: foundBooking ? foundBooking._id : null
      };
    });

    res.status(200).json(updatedListings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching listings", error: error.message });
  }
};

// 3. Find Single Listing
export const findListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('host', 'name email').lean();
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const booking = await Booking.findOne({ listing: id, status: 'Booked' }).select('_id');
    const finalData = { ...listing, bookingId: booking ? booking._id : null };

    return res.status(200).json(finalData);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// 4. Update Listing (FIXED: Structure aligned with Frontend)
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, rent, city, landmark, latitude, longitude, category } = req.body;

    const oldListing = await Listing.findById(id);
    if (!oldListing) return res.status(404).json({ message: "Listing not found" });

    let imageUrls = oldListing.images;
    if (req.files && Object.keys(req.files).length > 0) {
      imageUrls = [];
      for (const key of Object.keys(req.files)) {
        if (req.files[key] && req.files[key][0]) {
           const url = await uploadOnCloudinary(req.files[key][0].path);
           if (url) imageUrls.push(url);
        }
      }
    }

    const listing = await Listing.findByIdAndUpdate(id, {
      title, 
      description, 
      rent: Number(rent), 
      city, 
      landmark,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      category, 
      images: imageUrls
    }, { new: true }).lean();

    // Booking ID check karein taake data complete rahe
    const booking = await Booking.findOne({ listing: id }).select('_id');
    const updatedWithBooking = { ...listing, bookingId: booking ? booking._id : null };

    // Yeh key 'updatedListing' frontend ke ViewCard mein call ho rahi hai
    return res.status(200).json({ 
        message: "Updated Successfully", 
        updatedListing: updatedWithBooking 
    });

  } catch (error) {
    return res.status(500).json({ message: "Update Error", error: error.message });
  }
};

// 5. Delete Listing
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    await User.findByIdAndUpdate(listing.host, { $pull: { listing: listing._id } });
    await Booking.deleteMany({ listing: id });

    return res.status(200).json({ message: "Listing Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Delete Error", error: error.message });
  }
};

// 6. Rating Logic
export const ratingListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratings } = req.body;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not Found" });

    listing.ratings = Number(ratings);
    await listing.save();
    return res.status(200).json({ ratings: listing.ratings });
  } catch (error) {
    return res.status(500).json({ message: "Rating Error", error: error.message });
  }
};

// 7. Search Logic
export const search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search Query is Required" });

    const listings = await Listing.find({
      $or: [
        { landmark: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
      ],
    }).lean();

    const allBookings = await Booking.find().select('listing');

    const updatedListings = listings.map(list => ({
      ...list,
      bookingId: allBookings.find(b => b.listing.toString() === list._id.toString())?._id || null
    }));

    return res.status(200).json(updatedListings);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};